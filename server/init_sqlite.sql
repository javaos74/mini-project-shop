-- SQLite3 데이터베이스 초기화 스크립트
-- 기존 dev_class_2021-02-04.sql 데이터를 SQLite3 형식으로 변환

PRAGMA foreign_keys = ON;

-- t_category 테이블
DROP TABLE IF EXISTS t_category;
CREATE TABLE t_category (
  id INTEGER PRIMARY KEY,
  category1 VARCHAR(100) NOT NULL DEFAULT '',
  category2 VARCHAR(100) NOT NULL DEFAULT '',
  category3 VARCHAR(100) DEFAULT ''
);

INSERT INTO t_category (id, category1, category2, category3) VALUES
  (1, '전자제품', '컴퓨터', '악세사리'),
  (2, '전자제품', '컴퓨터', '노트북'),
  (3, '전자제품', '컴퓨터', '조립식'),
  (4, '전자제품', '가전제품', '텔레비전'),
  (5, '전자제품', '가전제품', '냉장고'),
  (6, '생필품', '주방용품', '조리도구');

-- t_seller 테이블
DROP TABLE IF EXISTS t_seller;
CREATE TABLE t_seller (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(100) NOT NULL DEFAULT '',
  phone VARCHAR(20) NOT NULL DEFAULT ''
);

INSERT INTO t_seller (id, name, email, phone) VALUES
  (1, '개발자의품격', 'seungwon.go@gmail.com', '010-1111-1111');

-- t_product 테이블
DROP TABLE IF EXISTS t_product;
CREATE TABLE t_product (
  id INTEGER PRIMARY KEY,
  product_name VARCHAR(200) NOT NULL DEFAULT '',
  product_price INTEGER NOT NULL DEFAULT 0,
  delivery_price INTEGER NOT NULL DEFAULT 0,
  add_delivery_price INTEGER NOT NULL DEFAULT 0,
  tags VARCHAR(100) DEFAULT NULL,
  outbound_days INTEGER NOT NULL DEFAULT 5,
  seller_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  active_yn TEXT NOT NULL DEFAULT 'Y' CHECK(active_yn IN ('Y','N')),
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES t_seller(id),
  FOREIGN KEY (category_id) REFERENCES t_category(id)
);

INSERT INTO t_product (id, product_name, product_price, delivery_price, add_delivery_price, tags, outbound_days, seller_id, category_id, active_yn, created_date) VALUES
  (1, 'K70 RGB MK.2 BROWN 기계식 게이밍 키보드 갈축', 219000, 2500, 5000, '키보드,기계식,게이밍', 5, 1, 1, 'Y', '2021-01-10 00:00:00'),
  (2, '로지텍 MX VERTICAL 인체공학 무선 마우스', 119000, 2500, 5000, '마우스', 5, 1, 1, 'Y', '2021-01-10 00:00:00'),
  (8, '테스트 제품 AAA', 23000, 5000, 2500, '테스트,노트북,악세사리', 5, 1, 1, 'Y', '2021-01-21 00:41:14'),
  (9, '제품 테스트2', 30000, 5000, 5000, '', 5, 1, 6, 'Y', '2021-01-21 01:19:28');

-- t_image 테이블
DROP TABLE IF EXISTS t_image;
CREATE TABLE t_image (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  type INTEGER NOT NULL DEFAULT 1, -- 1-썸네일, 2-제품이미지, 3-제품설명이미지
  path VARCHAR(150) NOT NULL DEFAULT '',
  FOREIGN KEY (product_id) REFERENCES t_product(id)
);

INSERT INTO t_image (id, product_id, type, path) VALUES
  (10, 1, 1, 'keyboard1.jpg'),
  (11, 1, 2, 'keyboard1.jpg'),
  (12, 1, 2, 'keyboard2.jpg'),
  (14, 1, 3, 'detail.jpg'),
  (15, 2, 1, 'mouse1.jpg'),
  (16, 2, 2, 'mouse1.jpg'),
  (17, 2, 3, 'detail.jpg'),
  (18, 1, 2, 'keyboard3.jpg'),
  (20, 8, 1, 'mousepad1.jpg'),
  (22, 8, 2, 'mousepad1.jpg'),
  (23, 8, 2, 'mousepad2.jpg'),
  (24, 8, 2, 'mousepad3.jpg'),
  (25, 8, 3, 'detail.jpg');

-- t_user 테이블
DROP TABLE IF EXISTS t_user;
CREATE TABLE t_user (
  email VARCHAR(50) PRIMARY KEY,
  type INTEGER NOT NULL DEFAULT 1, -- 1-buyer, 2-seller
  nickname VARCHAR(50) DEFAULT NULL
);

INSERT INTO t_user (email, type, nickname) VALUES
  ('seungwon.go@gmail.com', 1, '고승원');

-- SQLite에서는 AUTOINCREMENT를 사용할 때 sqlite_sequence 테이블이 자동으로 생성됩니다.
-- 명시적인 ID 값을 삽입했으므로 시퀀스는 자동으로 설정됩니다.