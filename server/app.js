require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const fs = require('fs');
const cors = require('cors');

app.use(session({
  secret: 'secret code',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 //쿠기 유효시간 1시간
  }
}));

app.use(express.json({
  limit: '50mb'
}));

// CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    // 환경변수에서 허용할 도메인 목록 가져오기
    const allowedOriginsFromEnv = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [];
    
    // 기본 허용 도메인 + 환경변수 도메인
    const allowedOrigins = [
      ...allowedOriginsFromEnv,
      // S3 정적 웹사이트 호스팅 URL 패턴
      /^https:\/\/.*\.s3-website.*\.amazonaws\.com$/,
      // CloudFront URL 패턴
      /^https:\/\/.*\.cloudfront\.net$/,
    ];
    
    // 개발 환경에서는 origin이 undefined일 수 있음 (Postman, 서버 간 통신 등)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 문자열 또는 정규식으로 origin 체크
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true, // 쿠키, 인증 헤더 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // IE11 지원
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server started. port ${PORT}.`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${process.env.ALLOWED_ORIGINS || 'default patterns'}`);
});

let sql = require('./sql.js');

fs.watchFile(__dirname + '/sql.js', (curr, prev) => {
  console.log('sql 변경시 재시작 없이 반영되도록 함.');
  delete require.cache[require.resolve('./sql.js')];
  sql = require('./sql.js');
});

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite 데이터베이스 연결
const dbPath = path.join(__dirname, 'dev_class.db');

// 데이터베이스 파일이 없으면 자동으로 초기화
if (!fs.existsSync(dbPath)) {
  console.log('Database file not found. Please run "npm run restore-data" first.');
}

const db = new sqlite3.Database(dbPath);

app.post('/api/login', async (request, res) => {
  try {
    const userInfo = request.body.param[0];
    const params = [userInfo.email, 1, userInfo.nickname];

    await req.db('signUp', params);

    if (request.body.param.length > 0) {
      for (let key in request.body.param[0]) request.session[key] = request.body.param[0][key];
      res.send(request.body.param[0]);
    } else {
      res.send({
        error: "Please try again or contact system manager."
      });
    }
  } catch (err) {
    res.send({
      error: "DB access error"
    });
  }
});

app.post('/api/logout', async (request, res) => {
  request.session.destroy();
  res.send('ok');
});

app.post('/upload/:productId/:type/:fileName', async (request, res) => {

  let {
    productId,
    type,
    fileName
  } = request.params;
  const dir = `${__dirname}/uploads/${productId}`;
  const file = `${dir}/${fileName}`;
  if (!request.body.data) return fs.unlink(file, async (err) => res.send({
    err
  }));
  const data = request.body.data.slice(request.body.data.indexOf(';base64,') + 8);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFile(file, data, 'base64', async (error) => {
    await req.db('productImageInsert', [productId, type, fileName]);

    if (error) {
      res.send({
        error
      });
    } else {
      res.send("ok");
    }
  });
});

app.get('/download/:productId/:fileName', (request, res) => {
  const {
    productId,
    type,
    fileName
  } = request.params;
  const filepath = `${__dirname}/uploads/${productId}/${fileName}`;
  res.header('Content-Type', `image/${fileName.substring(fileName.lastIndexOf("."))}`);
  if (!fs.existsSync(filepath)) res.send(404, {
    error: 'Can not found file.'
  });
  else fs.createReadStream(filepath).pipe(res);
});

app.post('/apirole/:alias', async (request, res) => {
  if (!request.session.email) {
    return res.status(401).send({
      error: 'You need to login.'
    });
  }

  try {
    res.send(await req.db(request.params.alias));
  } catch (err) {
    res.status(500).send({
      error: err
    });
  }
});

app.post('/api/:alias', async (request, res) => {
  try {
    let params = request.body.param;

    // productInsert의 경우 객체를 배열로 변환
    if (request.params.alias === 'productInsert' && params && params[0]) {
      const product = params[0];
      params = [
        product.product_name,
        product.product_price,
        product.delivery_price,
        product.add_delivery_price,
        product.tags,
        product.outbound_days,
        product.seller_id,
        product.category_id
      ];
    }

    res.send(await req.db(request.params.alias, params, request.body.where));
  } catch (err) {
    res.status(500).send({
      error: err
    });
  }
});

const req = {
  async db(alias, param = [], where = '') {
    return new Promise((resolve, reject) => {
      const query = sql[alias].query + where;

      if (query.toLowerCase().includes('select')) {
        db.all(query, param, (error, rows) => {
          if (error) {
            console.log(error);
            resolve({ error });
          } else {
            resolve(rows || []);
          }
        });
      } else {
        db.run(query, param, function (error) {
          if (error) {
            if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
              console.log(error);
            }
            resolve({ error });
          } else {
            resolve({
              insertId: this.lastID,
              affectedRows: this.changes,
              id: this.lastID
            });
          }
        });
      }
    });
  }
};