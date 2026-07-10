# Verdant — E-Shop Clone

A full-stack e-commerce demo application built with **React (Vite)** on the frontend and **Express + SQLite** on the backend. It supports guest and authenticated shopping carts, user registration/login, checkout with international shipping fields, and a full admin dashboard for product management (including image uploads).

> 🇧🇬 Българската версия на документацията се намира по-долу — [вижте тук](#-verdant--e-shop-клонинг-документация).

---

## 📚 Table of Contents (EN)

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Data Model](#data-model)
6. [API Reference](#api-reference)
7. [Getting Started](#getting-started)
8. [Default Accounts](#default-accounts)
9. [Known Limitations / Notes](#known-limitations--notes)

---

## Overview

**Verdant** is a demo online store ("e-shop clone") consisting of two independent applications that run side by side during development:

- **Frontend** — a React 19 single-page application (Vite-powered) that renders the storefront, product pages, cart drawer, checkout flow, authentication screens, and an admin dashboard.
- **Backend** — a lightweight Express 5 REST API backed by a local **SQLite** database (`backend/ecommerce.db`), handling authentication, product CRUD, cart persistence (for both logged-in users and anonymous guests), and order checkout.

The two apps communicate over HTTP; the frontend is hardcoded to call the backend at `http://localhost:5000`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + React Router DOM 7 |
| Build tool / dev server | Vite 8 (`@vitejs/plugin-react`) |
| Linting | Oxlint |
| Backend framework | Express 5 |
| Database | SQLite (via `sqlite` + `sqlite3` packages) |
| File uploads | Multer (disk storage, saved to `backend/public/images`) |
| Cross-origin requests | `cors` middleware |
| Styling | Plain CSS files per component (no CSS framework) |

---

## Project Structure

```
eshop-clone-main/
├── backend/
│   ├── server.js              # Express app entry point — all API routes
│   ├── cron.js                # Scheduled guest-cart cleanup job (not wired into server.js)
│   ├── ecommerce.db            # SQLite database file (auto-created/seeded on first run)
│   ├── data/
│   │   ├── db.js               # DB connection, schema creation & seed data
│   │   ├── products.js         # Legacy in-memory product array (unused by server.js)
│   │   └── cartStore.js        # Legacy in-memory cart mock (unused by server.js)
│   └── public/
│       └── images/             # Uploaded / seeded product images, served statically
│
├── src/
│   ├── main.jsx                 # React entry point, wraps App in Router + Context providers
│   ├── App.jsx                  # Route definitions, auth/guest state, global handlers
│   ├── App.css / index.css      # Global styles
│   ├── context/
│   │   ├── CartContext.jsx      # Cart state + API calls (fetch/add/remove/clear)
│   │   └── ProductContext.jsx   # In-memory cache for product list/details (avoids refetching)
│   ├── data/
│   │   └── countries.js         # Country list with phone codes/digit rules for checkout
│   ├── assets/                  # Static images (hero image, etc.)
│   └── components/
│       ├── Header.jsx / .css        # Top navigation, category menu, cart icon, auth links
│       ├── Footer.jsx / .css        # Site footer
│       ├── Home.jsx / .css          # Landing/hero section
│       ├── ProductList.jsx / .css   # Catalog grid — search, filter, sort
│       ├── ProductCard.jsx / .css   # Individual product tile
│       ├── ProductDetails.jsx / .css# Single product page
│       ├── Cart.jsx / .css          # Slide-out cart drawer
│       ├── CheckoutPage.jsx / .css  # Shipping form + order placement + country/phone picker
│       ├── AuthPage.jsx / .css      # Tabbed container for Login/Register
│       ├── Login.jsx / .css         # Login form
│       ├── Register.jsx / .css      # Registration form
│       ├── ProtectedRoute.jsx       # Role-based route guard (used for /admin)
│       ├── AdminDashboard.jsx / .css# Product CRUD dashboard with stats, search, image upload
│       └── NotFound.jsx / .css      # 404 page
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── index.html
├── vite.config.js
├── package.json
├── package-lock.json
└── .oxlintrc.json
```

---

## Features

### Storefront (customer-facing)
- Product catalog with **search, category filter, stock filter, price filter, and sorting** (price/name ascending & descending).
- Product detail page.
- **Cart works for both guests and logged-in users.** A random `guestId` is generated and stored in `localStorage` for anonymous visitors; the cart is persisted server-side either by `user_id` or `guest_id`.
- Adding to cart, removing items, live cart count/total in the header and slide-out drawer.
- **Guest cart migration:** when a guest logs in or registers, their guest cart is automatically merged into their user cart (`/api/cart/migrate`), and the `guestId` is cleared.
- **Checkout flow** with full shipping form: full name, country selector, address, and a phone number field with **per-country dialing code and digit-length validation** (via `src/data/countries.js`).
- Checkout requires authentication (guests are asked to log in before placing an order).
- Order placement performs **stock validation**, decrements product stock, records the order + order items, and clears the user's cart.

### Authentication
- Simple username/password registration and login (passwords are stored **in plain text** in SQLite — see [Known Limitations](#known-limitations--notes)).
- On successful auth, the server returns a static `authToken` and `role` (`customer` or `admin`), which the frontend stores in `localStorage` and sends as the `Authorization` header on subsequent requests.
- `ProtectedRoute` restricts `/admin` to users with the `admin` role.

### Admin Dashboard (`/admin`, admin role only)
- Dashboard stats: total products, total inventory value, low-stock count.
- Search/filter existing products.
- Add new products with an image upload (via `multipart/form-data` + Multer).
- Edit existing products, optionally replacing the image (keeps the old image if none is provided).
- Delete products (with a two-step "confirm" click before deleting).
- Toast notifications for success/error feedback.

---

## Data Model

The SQLite schema (auto-created on first backend start, in `backend/data/db.js`):

| Table | Key Columns | Purpose |
|---|---|---|
| `users` | `id`, `username` (unique), `password`, `role` (`customer`/`admin`), `token` | Stores accounts and static auth tokens |
| `products` | `id`, `name` (unique), `price`, `category`, `stock`, `image_path`, `description` | Product catalog |
| `cart_items` | `id`, `user_id` / `guest_id`, `product_id`, `quantity`, `updated_at` | Cart rows, scoped to either a logged-in user or a guest ID |
| `orders` | `id`, `user_id`, `full_name`, `shipping_address`, `contact_phone`, `total_amount`, `created_at` | Placed orders |
| `order_items` | `id`, `order_id`, `product_id`, `quantity`, `price_at_purchase` | Line items for each order (price snapshotted at purchase time) |

On first run, the database is **seeded automatically** with 5 sample products (T-shirt, jeans, sneakers, wallet, jacket) and 2 demo accounts (see [Default Accounts](#default-accounts)). Seeding uses `INSERT OR IGNORE`, so it's safe across restarts and won't duplicate rows.

---

## API Reference

Base URL: `http://localhost:5000`

### Auth
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/login` | `{ username, password }` | Returns `{ success, authToken, role }` |
| POST | `/api/auth/register` | `{ username, password }` | Creates a `customer` account, returns `{ success, authToken, role }` |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | Lightweight product list (id, name, price, category, stock, image) |
| GET | `/api/products/:id` | — | Full product details |
| POST | `/api/products` | Admin | Create product (`multipart/form-data`, field `productImage` for the image) |
| PUT | `/api/products/:id` | Admin | Update product (image optional — keeps old one if omitted) |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Cart
| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/api/cart?guestId=...` | — | Fetch current cart (uses `Authorization` header if present, else `guestId` query param) |
| POST | `/api/cart/add` | `{ productId, guestId, authToken }` | Add one unit of a product (creates row or increments quantity) |
| POST | `/api/cart/remove` | `{ productId, guestId }` | Remove a product line entirely from the cart |
| POST | `/api/cart/migrate` | `{ guestId }` | Merge a guest cart into the logged-in user's cart |

### Orders
| Method | Endpoint | Body | Auth | Description |
|---|---|---|---|---|
| POST | `/api/orders/checkout` | `{ fullName, shippingAddress, contactPhone }` | Required | Validates stock, creates order + order items, decrements stock, clears cart |

**Authentication header:** protected/aware endpoints read the token from the `Authorization` header (raw token, not a `Bearer` prefix).

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Install dependencies
```bash
npm install
```
This installs both frontend and backend dependencies since they share a single `package.json`.

### 2. Start the backend API server
```bash
node backend/server.js
```
This starts Express on **http://localhost:5000**, auto-creates/seeds `backend/ecommerce.db` if it doesn't exist, and serves uploaded images from `backend/public/images`.

### 3. Start the frontend dev server (in a separate terminal)
```bash
npm run dev
```
This starts Vite on its default port (typically **http://localhost:5173**) with hot module reloading.

### Other scripts
```bash
npm run build     # Production build of the frontend (outputs to dist/)
npm run preview   # Preview the production build locally
npm run lint       # Run Oxlint
```

> ⚠️ There is currently no single script to run frontend and backend together — start both processes separately, as shown above.

---

## Default Accounts

Seeded automatically into `users` on first backend startup:

| Role | Username | Password |
|---|---|---|
| Customer | `customer@eshop.com` | `pass123` |
| Admin | `admin@eshop.com` | `admin456` |

Use the admin account to access `/admin` and manage the product catalog.

---

## Known Limitations / Notes

- **Passwords are stored in plain text** and auth tokens are simple random strings generated at registration/seed time (no hashing, no expiry, no JWT). This is fine for a learning/demo project but is **not production-secure**.
- The frontend has the backend URL (`http://localhost:5000`) **hardcoded** in multiple components rather than using an environment variable — update these if deploying to a different host/port.
- `backend/cron.js` defines a guest-cart garbage-collection job but is **not imported/started** by `server.js` — it exists but isn't currently active.
- `backend/data/products.js` and `backend/data/cartStore.js` are **legacy/unused** in-memory mock files, superseded by the SQLite-backed logic in `db.js` and `server.js`.
- No automated tests are included in this project.
- CORS is fully open (`cors()` with no options), suitable for local development only.

---
---

# 🇧🇬 Verdant — E-Shop Клонинг: Документация

Пълноценно демонстрационно приложение за електронна търговия, изградено с **React (Vite)** за клиентската част (frontend) и **Express + SQLite** за сървърната част (backend). Поддържа количка за пазаруване както за гости, така и за регистрирани потребители, регистрация/вход, поръчка с международни данни за доставка, и пълен административен панел за управление на продукти (включително качване на изображения).

---

## 📚 Съдържание (BG)

1. [Общ преглед](#общ-преглед)
2. [Технологии](#технологии)
3. [Структура на проекта](#структура-на-проекта)
4. [Функционалности](#функционалности)
5. [Модел на данните](#модел-на-данните)
6. [API справочник](#api-справочник)
7. [Стартиране на проекта](#стартиране-на-проекта)
8. [Акаунти по подразбиране](#акаунти-по-подразбиране)
9. [Известни ограничения / Забележки](#известни-ограничения--забележки)

---

## Общ преглед

**Verdant** е демонстрационен онлайн магазин ("e-shop клонинг"), състоящ се от две отделни приложения, които работят едновременно по време на разработка:

- **Frontend** — едностранично React 19 приложение (задвижвано от Vite), което визуализира витрината на магазина, страниците с продукти, количката, процеса на поръчка, екраните за автентикация и административния панел.
- **Backend** — лек Express 5 REST API, използващ локална **SQLite** база данни (`backend/ecommerce.db`), който обработва автентикация, CRUD операции с продукти, съхранение на количката (както за влезли потребители, така и за анонимни гости) и финализиране на поръчки.

Двете приложения комуникират чрез HTTP; клиентската част е конфигурирана да извиква backend-a на адрес `http://localhost:5000`.

---

## Технологии

| Слой | Технология |
|---|---|
| Frontend framework | React 19 + React Router DOM 7 |
| Инструмент за билд / dev сървър | Vite 8 (`@vitejs/plugin-react`) |
| Линтване | Oxlint |
| Backend framework | Express 5 |
| База данни | SQLite (чрез пакетите `sqlite` и `sqlite3`) |
| Качване на файлове | Multer (дисково съхранение, записва в `backend/public/images`) |
| Cross-origin заявки | `cors` middleware |
| Стилизиране | Обикновени CSS файлове за всеки компонент (без CSS framework) |

---

## Структура на проекта

```
eshop-clone-main/
├── backend/
│   ├── server.js              # Входна точка на Express приложението — всички API маршрути
│   ├── cron.js                # Планирана задача за почистване на гост-количките (не е свързана в server.js)
│   ├── ecommerce.db            # SQLite файл с базата данни (автоматично се създава/пълни при първо стартиране)
│   ├── data/
│   │   ├── db.js               # Връзка с БД, създаване на схема и начални данни
│   │   ├── products.js         # Стар (неизползван) масив с продукти в паметта
│   │   └── cartStore.js        # Стар (неизползван) mock на количка в паметта
│   └── public/
│       └── images/             # Качени/начални изображения на продукти, сервирани статично
│
├── src/
│   ├── main.jsx                 # Входна точка на React, обвива App в Router + Context provider-и
│   ├── App.jsx                  # Дефиниции на маршрутите, състояние на автентикация/гост, глобални функции
│   ├── App.css / index.css      # Глобални стилове
│   ├── context/
│   │   ├── CartContext.jsx      # Състояние на количката + API извиквания (fetch/add/remove/clear)
│   │   └── ProductContext.jsx   # Кеш в паметта за списъка/детайлите на продуктите (избягва повторно зареждане)
│   ├── data/
│   │   └── countries.js         # Списък с държави с телефонни кодове/правила за брой цифри за поръчката
│   ├── assets/                  # Статични изображения (hero изображение и др.)
│   └── components/
│       ├── Header.jsx / .css        # Горна навигация, меню с категории, икона на количка, връзки за вход
│       ├── Footer.jsx / .css        # Долен колонтитул на сайта
│       ├── Home.jsx / .css          # Начална/hero секция
│       ├── ProductList.jsx / .css   # Мрежа с каталога — търсене, филтриране, сортиране
│       ├── ProductCard.jsx / .css   # Отделна карта на продукт
│       ├── ProductDetails.jsx / .css# Страница на отделен продукт
│       ├── Cart.jsx / .css          # Плъзгащо се чекмедже с количката
│       ├── CheckoutPage.jsx / .css  # Формуляр за доставка + поръчка + избор на държава/телефон
│       ├── AuthPage.jsx / .css      # Контейнер с табове за Вход/Регистрация
│       ├── Login.jsx / .css         # Формуляр за вход
│       ├── Register.jsx / .css      # Формуляр за регистрация
│       ├── ProtectedRoute.jsx       # Защита на маршрут по роля (използва се за /admin)
│       ├── AdminDashboard.jsx / .css# CRUD панел за продукти със статистика, търсене, качване на изображения
│       └── NotFound.jsx / .css      # Страница 404
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── index.html
├── vite.config.js
├── package.json
├── package-lock.json
└── .oxlintrc.json
```

---

## Функционалности

### Витрина на магазина (за клиенти)
- Каталог с продукти с **търсене, филтриране по категория, наличност, цена и сортиране** (по цена/име, възходящо и низходящо).
- Страница с детайли за продукт.
- **Количката работи както за гости, така и за влезли потребители.** За анонимни посетители се генерира случаен `guestId`, съхранен в `localStorage`; количката се пази на сървъра чрез `user_id` или `guest_id`.
- Добавяне в количката, премахване на артикули, брой артикули/обща сума в реално време в горното меню и плъзгащото се чекмедже.
- **Прехвърляне на гост-количка:** когато гост влезе в профила си или се регистрира, неговата гост-количка автоматично се слива с количката на потребителя (`/api/cart/migrate`), а `guestId` се изчиства.
- **Процес на поръчка** с пълен формуляр за доставка: пълно име, избор на държава, адрес и поле за телефонен номер с **валидация на телефонния код и броя цифри спрямо държавата** (чрез `src/data/countries.js`).
- Поръчката изисква автентикация (гостите биват подканени да влязат в профила си, преди да завършат поръчка).
- Финализирането на поръчка извършва **проверка на наличностите**, намалява наличния брой на продукта, записва поръчката и артикулите в нея, и изчиства количката на потребителя.

### Автентикация
- Проста регистрация и вход с потребителско име и парола (паролите се съхраняват **в чист текст** в SQLite — вижте [Известни ограничения](#известни-ограничения--забележки)).
- При успешна автентикация сървърът връща статичен `authToken` и `role` (`customer` или `admin`), които клиентската част съхранява в `localStorage` и изпраща като хедър `Authorization` при следващите заявки.
- `ProtectedRoute` ограничава достъпа до `/admin` само за потребители с роля `admin`.

### Административен панел (`/admin`, само за роля admin)
- Статистика на панела: общ брой продукти, обща стойност на наличностите, брой продукти с ниска наличност.
- Търсене/филтриране на съществуващи продукти.
- Добавяне на нови продукти с качване на изображение (чрез `multipart/form-data` + Multer).
- Редактиране на съществуващи продукти, с опция за смяна на изображението (запазва старото, ако не е предоставено ново).
- Изтриване на продукти (с двустъпково потвърждение преди самото изтриване).
- Toast известия за успех/грешка.

---

## Модел на данните

SQLite схемата (автоматично се създава при първото стартиране на backend-а, в `backend/data/db.js`):

| Таблица | Основни колони | Предназначение |
|---|---|---|
| `users` | `id`, `username` (уникално), `password`, `role` (`customer`/`admin`), `token` | Съхранява акаунтите и статичните токени за автентикация |
| `products` | `id`, `name` (уникално), `price`, `category`, `stock`, `image_path`, `description` | Каталог с продукти |
| `cart_items` | `id`, `user_id` / `guest_id`, `product_id`, `quantity`, `updated_at` | Редове на количката, свързани с потребител или гост ID |
| `orders` | `id`, `user_id`, `full_name`, `shipping_address`, `contact_phone`, `total_amount`, `created_at` | Направени поръчки |
| `order_items` | `id`, `order_id`, `product_id`, `quantity`, `price_at_purchase` | Артикули за всяка поръчка (цената се записва в момента на покупката) |

При първото стартиране базата данни се **зарежда автоматично** с 5 примерни продукта (тениска, дънки, маратонки, портфейл, яке) и 2 демо акаунта (вижте [Акаунти по подразбиране](#акаунти-по-подразбиране)). Зареждането използва `INSERT OR IGNORE`, така че е безопасно при рестарт и не създава дублирани редове.

---

## API справочник

Базов адрес: `http://localhost:5000`

### Автентикация
| Метод | Маршрут | Тяло | Описание |
|---|---|---|---|
| POST | `/api/auth/login` | `{ username, password }` | Връща `{ success, authToken, role }` |
| POST | `/api/auth/register` | `{ username, password }` | Създава акаунт с роля `customer`, връща `{ success, authToken, role }` |

### Продукти
| Метод | Маршрут | Автентикация | Описание |
|---|---|---|---|
| GET | `/api/products` | — | Облекчен списък с продукти (id, name, price, category, stock, image) |
| GET | `/api/products/:id` | — | Пълни детайли за продукт |
| POST | `/api/products` | Admin | Създава продукт (`multipart/form-data`, поле `productImage` за изображението) |
| PUT | `/api/products/:id` | Admin | Обновява продукт (изображението е по избор — запазва старото, ако не е подадено ново) |
| DELETE | `/api/products/:id` | Admin | Изтрива продукт |

### Количка
| Метод | Маршрут | Тяло | Описание |
|---|---|---|---|
| GET | `/api/cart?guestId=...` | — | Извлича текущата количка (използва хедъра `Authorization`, ако е наличен, иначе query параметъра `guestId`) |
| POST | `/api/cart/add` | `{ productId, guestId, authToken }` | Добавя единица от продукт (създава ред или увеличава количеството) |
| POST | `/api/cart/remove` | `{ productId, guestId }` | Премахва изцяло даден продукт от количката |
| POST | `/api/cart/migrate` | `{ guestId }` | Слива гост-количка с количката на влезлия потребител |

### Поръчки
| Метод | Маршрут | Тяло | Автентикация | Описание |
|---|---|---|---|---|
| POST | `/api/orders/checkout` | `{ fullName, shippingAddress, contactPhone }` | Задължителна | Проверява наличностите, създава поръчка + артикули, намалява наличностите, изчиства количката |

**Хедър за автентикация:** защитените/зависимите от контекст маршрути четат токена от хедъра `Authorization` (суров токен, без префикс `Bearer`).

---

## Стартиране на проекта

### Изисквания
- Node.js (препоръчва се v18+)
- npm

### 1. Инсталиране на зависимостите
```bash
npm install
```
Това инсталира зависимостите както за клиентската, така и за сървърната част, тъй като споделят един `package.json`.

### 2. Стартиране на backend API сървъра
```bash
node backend/server.js
```
Това стартира Express на **http://localhost:5000**, автоматично създава/зарежда `backend/ecommerce.db`, ако не съществува, и сервира качените изображения от `backend/public/images`.

### 3. Стартиране на frontend dev сървъра (в отделен терминал)
```bash
npm run dev
```
Това стартира Vite на порта по подразбиране (обикновено **http://localhost:5173**) с hot module reloading.

### Други команди
```bash
npm run build     # Продукционен билд на клиентската част (изход в dist/)
npm run preview   # Локален преглед на продукционния билд
npm run lint       # Стартира Oxlint
```

> ⚠️ В момента няма единен скрипт за едновременно стартиране на клиентската и сървърната част — стартирайте двата процеса поотделно, както е показано по-горе.

---

## Акаунти по подразбиране

Зареждат се автоматично в таблицата `users` при първо стартиране на backend-а:

| Роля | Потребителско име | Парола |
|---|---|---|
| Клиент | `customer@eshop.com` | `pass123` |
| Администратор | `admin@eshop.com` | `admin456` |

Използвайте администраторския акаунт, за да достъпите `/admin` и да управлявате каталога с продукти.

---

## Известни ограничения / Забележки

- **Паролите се съхраняват в чист текст**, а токените за автентикация са прости произволни низове, генерирани при регистрация/зареждане (без хеширане, без изтичане на валидност, без JWT). Това е подходящо за учебен/демонстрационен проект, но **не е сигурно за продукционна среда**.
- Адресът на backend-а (`http://localhost:5000`) е **твърдо закодиран** в няколко компонента на клиентската част, вместо да се използва променлива на средата — обновете ги, ако проектът се разгръща на друг хост/порт.
- `backend/cron.js` дефинира задача за почистване на изоставени гост-количкии. Тя обаче **не е импортирана/стартирана** от `server.js` — съществува, но в момента не е активна.
- `backend/data/products.js` и `backend/data/cartStore.js` са **стари/неизползвани** mock файлове с данни в паметта, заменени от логиката, базирана на SQLite, в `db.js` и `server.js`.
- Проектът не включва автоматизирани тестове.
- CORS е напълно отворен (`cors()` без опции), подходящ единствено за локална разработка.
