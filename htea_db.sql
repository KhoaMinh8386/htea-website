--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-03-05 06:51:03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 32788)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    name character varying(255) NOT NULL,
    price integer NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 32787)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- TOC entry 4860 (class 0 OID 0)
-- Dependencies: 221
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 226 (class 1259 OID 40976)
-- Name: orderlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orderlist (
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    total_price numeric(10,2),
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orderlist OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 40975)
-- Name: orderlist_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orderlist_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orderlist_order_id_seq OWNER TO postgres;

--
-- TOC entry 4861 (class 0 OID 0)
-- Dependencies: 225
-- Name: orderlist_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orderlist_order_id_seq OWNED BY public.orderlist.order_id;


--
-- TOC entry 218 (class 1259 OID 32771)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    customer_name character varying(255) NOT NULL,
    total_price numeric NOT NULL,
    items jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 32770)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 4862 (class 0 OID 0)
-- Dependencies: 217
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 228 (class 1259 OID 40990)
-- Name: ordersusers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordersusers (
    id integer NOT NULL,
    user_id integer,
    username character varying(255) NOT NULL,
    product_id integer,
    product_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT ordersusers_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT ordersusers_total_price_check CHECK ((total_price >= (0)::numeric))
);


ALTER TABLE public.ordersusers OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 40989)
-- Name: ordersusers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordersusers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordersusers_id_seq OWNER TO postgres;

--
-- TOC entry 4863 (class 0 OID 0)
-- Dependencies: 227
-- Name: ordersusers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordersusers_id_seq OWNED BY public.ordersusers.id;


--
-- TOC entry 220 (class 1259 OID 32781)
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    price integer NOT NULL
);


ALTER TABLE public.product OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 32780)
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_id_seq OWNER TO postgres;

--
-- TOC entry 4864 (class 0 OID 0)
-- Dependencies: 219
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- TOC entry 224 (class 1259 OID 40961)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 40960)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4865 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4669 (class 2604 OID 32791)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 4672 (class 2604 OID 40979)
-- Name: orderlist order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orderlist ALTER COLUMN order_id SET DEFAULT nextval('public.orderlist_order_id_seq'::regclass);


--
-- TOC entry 4666 (class 2604 OID 32774)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4675 (class 2604 OID 40993)
-- Name: ordersusers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordersusers ALTER COLUMN id SET DEFAULT nextval('public.ordersusers_id_seq'::regclass);


--
-- TOC entry 4668 (class 2604 OID 32784)
-- Name: product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- TOC entry 4670 (class 2604 OID 40964)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4848 (class 0 OID 32788)
-- Dependencies: 222
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, name, price, quantity) FROM stdin;
\.


--
-- TOC entry 4852 (class 0 OID 40976)
-- Dependencies: 226
-- Data for Name: orderlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orderlist (order_id, user_id, total_price, status, created_at) FROM stdin;
\.


--
-- TOC entry 4844 (class 0 OID 32771)
-- Dependencies: 218
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, customer_name, total_price, items, created_at, user_id) FROM stdin;
2	Trần Thị B	90000	[{"name": "Trà Xanh Latte", "price": 35000, "quantity": 1}, {"name": "Trà Đào", "price": 55000, "quantity": 1}]	2025-03-03 16:06:19.908987	\N
3	Lê Văn C	75000	[{"name": "Trà Oolong", "price": 75000, "quantity": 1}]	2025-03-03 16:06:19.908987	\N
4	Tên Mới	99999	[{"name": "Món Mới", "price": 50000, "quantity": 2}]	2025-03-03 16:59:53.820363	\N
5	minh khoa	200000	[{"name": "trà đào", "price": "2", "quantity": "2"}]	2025-03-03 17:02:34.110712	\N
8	khoa dep trai	55000	[{"id": 3, "name": "Trà Đào", "price": 55000, "quantity": 1}]	2025-03-04 15:16:10.573866	\N
9	hoàng	45000	[{"id": 6, "name": "Hồng Trà Kem Cheese", "price": 45000, "quantity": 1}]	2025-03-04 15:19:29.118454	\N
10	dsfsggs	68000	[{"id": 1, "name": "Trà Sữa Truyền Thống", "price": 30000, "quantity": 1}, {"id": 8, "name": "Trà Sen Vàng", "price": 38000, "quantity": 1}]	2025-03-04 15:20:43.783337	\N
\.


--
-- TOC entry 4854 (class 0 OID 40990)
-- Dependencies: 228
-- Data for Name: ordersusers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordersusers (id, user_id, username, product_id, product_name, quantity, total_price, created_at) FROM stdin;
\.


--
-- TOC entry 4846 (class 0 OID 32781)
-- Dependencies: 220
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (id, name, price) FROM stdin;
1	Trà Sữa Truyền Thống	30000
2	Trà Xanh Latte	35000
3	Trà Đào	55000
4	Trà Oolong	75000
5	Trà Sữa Matcha	40000
6	Hồng Trà Kem Cheese	45000
7	Trà Sữa Trân Châu Đường Đen	50000
8	Trà Sen Vàng	38000
9	Sữa Chua Trân Châu	42000
10	Nước Ép Cam	30000
11	Nước Ép Ổi	32000
12	Nước Ép Cà Rốt	29000
13	Nước Ép Dưa Hấu	33000
14	Sinh Tố Bơ	45000
15	Sinh Tố Xoài	40000
16	Sinh Tố Dâu	42000
17	Cà Phê Đen	25000
18	Cà Phê Sữa	30000
19	Latte	35000
20	Cappuccino	36000
21	Trà sữa truyền thống	35000
22	Trà ô long sữa	38000
23	Trà đen sữa	36000
24	Trà xanh sữa	37000
25	Trà thảo mộc mật ong	40000
26	Trà đào cam sả	42000
27	Trà vải hồng	41000
28	Trà chanh mật ong	39000
29	Trà xanh nhài	34000
30	Hồng trà dâu tây	45000
31	Sữa tươi trân châu đường đen	46000
32	Cà phê sữa đá	30000
33	Cà phê đen	28000
34	Latte caramel	48000
35	Matcha latte	50000
36	Socola nóng	47000
37	Nước ép cam	35000
38	Nước ép dưa hấu	34000
39	Nước ép ổi	32000
40	Nước ép táo	33000
\.


--
-- TOC entry 4850 (class 0 OID 40961)
-- Dependencies: 224
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, created_at) FROM stdin;
1	khoa	$2b$10$b1RupzapSjRM2SVyv535KOqzBu2eqdy2ZkaEvVegu7QnyaZQEuuJy	2025-03-04 16:07:45.660858
2	tinh	$2b$10$fBlKU5ii7snuK5xltyRSwOqA9ROghYL5moFtF0QYzUsvvgDLVLw/.	2025-03-04 16:30:20.982641
\.


--
-- TOC entry 4866 (class 0 OID 0)
-- Dependencies: 221
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- TOC entry 4867 (class 0 OID 0)
-- Dependencies: 225
-- Name: orderlist_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orderlist_order_id_seq', 1, false);


--
-- TOC entry 4868 (class 0 OID 0)
-- Dependencies: 217
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 10, true);


--
-- TOC entry 4869 (class 0 OID 0)
-- Dependencies: 227
-- Name: ordersusers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordersusers_id_seq', 1, false);


--
-- TOC entry 4870 (class 0 OID 0)
-- Dependencies: 219
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_id_seq', 40, true);


--
-- TOC entry 4871 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 4684 (class 2606 OID 32793)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4690 (class 2606 OID 40983)
-- Name: orderlist orderlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orderlist
    ADD CONSTRAINT orderlist_pkey PRIMARY KEY (order_id);


--
-- TOC entry 4680 (class 2606 OID 32779)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4692 (class 2606 OID 41000)
-- Name: ordersusers ordersusers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordersusers
    ADD CONSTRAINT ordersusers_pkey PRIMARY KEY (id);


--
-- TOC entry 4682 (class 2606 OID 32786)
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- TOC entry 4686 (class 2606 OID 40967)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4688 (class 2606 OID 40969)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4694 (class 2606 OID 32794)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4695 (class 2606 OID 40984)
-- Name: orderlist orderlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orderlist
    ADD CONSTRAINT orderlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4693 (class 2606 OID 40970)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4696 (class 2606 OID 41006)
-- Name: ordersusers ordersusers_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordersusers
    ADD CONSTRAINT ordersusers_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;


--
-- TOC entry 4697 (class 2606 OID 41001)
-- Name: ordersusers ordersusers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordersusers
    ADD CONSTRAINT ordersusers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-03-05 06:51:03

--
-- PostgreSQL database dump complete
--

