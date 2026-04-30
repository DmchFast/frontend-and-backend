# Практическое задание №24: Отчёт по всей работе

[![Node.js](https://img.shields.io/badge/Node.js-18+-3C873A?style=for-the-badge&logo=nodedotjs&labelColor=303030)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-404d59?style=for-the-badge&logo=express&logoColor=58b7d3&labelColor=303030)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-316192?style=for-the-badge&logo=postgresql&labelColor=303030&logoColor=white)](https://www.postgresql.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&labelColor=303030&logoColor=white)](https://www.mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7-D82C20?style=for-the-badge&logo=redis&labelColor=303030&logoColor=white)](https://redis.io)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&labelColor=303030&logoColor=white)](https://nginx.org)
[![Docker](https://img.shields.io/badge/Docker-27.0-2496ED?style=for-the-badge&logo=docker&labelColor=303030&logoColor=white)](https://www.docker.com)
[![HAProxy](https://img.shields.io/badge/HAProxy-2.8-1c6e99?style=for-the-badge&logo=haproxy&labelColor=303030&logoColor=white)](https://www.haproxy.org)
[![Nodejs](https://img.shields.io/badge/24.13.1-3C873A?style=for-the-badge&logo=node.js&label=Node.js&labelColor=303030&logoColor=3C873A)]()
[![Express](https://img.shields.io/badge/5.2.1-404d59?style=for-the-badge&logo=express&logoColor=58b7d3&label=Express.js&labelColor=303030)]()
[![JavaScript](https://img.shields.io/badge/ES6+-F7DF1E?style=for-the-badge&logo=javascript&label=JavaScript&labelColor=303030)]()

## Структура проекта

```
frontend-and-backend/
├── book19/          # PostgreSQL
├── book20/          # MongoDB
├── book21/          # Кэширование с использованием Redis
├── book22/          # WБалансировка нагрузки в веб-приложениях
├── book23/          # Контейнеризация приложений с Docker
├── book24/          # Отчёт по 19-24 book
└── README.md
```

---

## Практическое задание №19: PostgreSQL

Сервер на **Express** + **Sequelize**, хранящий данные в реляционной СУБД **PostgreSQL**.

### Сущность `User`
| Поле        | Тип      | Описание                      |
|-------------|----------|-------------------------------|
| `id`        | INTEGER  | Первичный ключ, автоинкремент |
| `first_name`| VARCHAR  | Имя (обязательное)            |
| `last_name` | VARCHAR  | Фамилия (обязательное)        |
| `age`       | INTEGER  | Возраст (≥ 0)                 |
| `created_at`| TIMESTAMP| Дата создания (автоматически) |
| `updated_at`| TIMESTAMP| Дата обновления (автоматически)|

**Файлы:** `book19/`

### Эндпоинты
|    Маршруты          |        Описние            |
|----------------------|---------------------------|
|POST   /api/users     |создать пользователя       |
|GET    /api/users     |список всех пользователей  |
|GET    /api/users/:id |пользователь по id         |
|PATCH  /api/users/:id |изменить пользователя      |
|DELETE /api/users/:id |удалить пользователя       |

**Результат:**  
Полностью рабочее REST API, реализующее CRUD-операции с сохранением данных в PostgreSQL. Все маршруты протестированы – создание, чтение, обновление и удаление пользователей проходят корректно, связи между таблицами работают, транзакции обеспечивают целостность данных.

### Запуск
```bash
cd book19
npm install
# Послесозданной базы данных в PostgreSQL
node server.js
# → http://localhost:3000
```

---

## Практическое задание №20: MongoDB

Сервер на **Express** данные хранятся в СУБД **MongoDB**.

### Эндпоинты
|    Маршруты          |        Описние            |
|----------------------|---------------------------|
|POST   /api/users     |создать пользователя       |
|GET    /api/users     |список всех пользователей  |
|GET    /api/users/:id |пользователь по id         |
|PATCH  /api/users/:id |изменить пользователя      |
|DELETE /api/users/:id |удалить пользователя       |

```bash
{
  first_name: { type: String, required: true },
  last_name:  { type: String, required: true },
  age:        { type: Number, min: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}
```

**Файлы:** `book20/`

**Результат:**  
Приложение успешно подключается к MongoDB, все CRUD-операции работают. Отсутствие фиксированной схемы позволяет легко добавлять новые поля без миграций, что подтверждено тестированием. Производительность на чтение/запись соответствует ожиданиям для документной модели.

### Запуск

```bash
cd book20
npm install
# Запуск MongoDB (локально или через Docker)
node server.js
# → http://localhost:3000
```

---

## Практическое задание №21: Кэширование с использованием Redis

К существующему API (пользователи + товары) добавлено in‑memory хранилище Redis для кэширования часто запрашиваемых данных.


|    Маршруты          |    Время жизни кэша       |
|----------------------|---------------------------|
|GET /api/users        |       1 минута            |
|GET /api/users/:id    |       1 минута            |
|GET /api/products     |       10 минут            |
|GET /api/products/:id |       10 минут            |

При создании, обновлении или удалении данных кэш **инвалидируется**.

**Результат:**  
Значительно сокращена нагрузка на сервер и ускорены ответы на повторные запросы. При первом обращении данные сохраняются в Redis, а все последующие запросы в течение заданного TTL возвращаются из кэша (source: "cache"). После обновления данных кэш очищается, гарантируя актуальность информации.

### Запуск

```bash
cd book21
npm install
# Запуск Redis (docker run -d --name redis-cache -p 6379:6379 redis)
node server.js
```

---

## Практическое задание №22: Балансировка нагрузки в веб-приложениях

Настроена балансировка между несколькими экземплярами backend‑сервера на Node.js с помощью Nginx и HAProxy.

**Файлы:** `book22/`

### Запуск backend‑серверов

```bash
node server.js 3000  # backend-1
node server.js 3001  # backend-2
node server.js 3002  # резервный (backup)
```

### Nginx

Конфигурация `nginx.conf`:

```bash
upstream backend {
    server 127.0.0.1:3000 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3001 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3002 backup;
}
server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

### HAProxy

Конфигурация haproxy.cfg:

```bash
frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    server server1 127.0.0.1:3000 check
    server server2 127.0.0.1:3001 check
```
**Результат:**  
При последовательных запросах ответы чередуются между backend-ами (round-robin). При остановке одного из серверов балансировщик автоматически исключает его из обработки и направляет трафик на оставшиеся. Резервный сервер вступает в работу только при отказе всех основных. Настройки max_fails и fail_timeout подтверждают корректную работу health checks.

---

## Практическое задание №23: Контейнеризация приложений с Docker

Состав сервисов:
- nginx – балансировщик на базе образа nginx:alpine, принимает внешние запросы на порт 80.

- backend1 – первый экземпляр Node.js, отвечает {"server":"backend-1"}.

- backend2 – второй экземпляр, идентичен первому, но возвращает {"server":"backend-2"}.

Все сервисы объединены в сеть app-network типа bridge. Внешний порт проброшен только для nginx.

**Файлы:** `book23/`

**Результат:**
Стек полностью контейнеризирован и запускается одной командой `docker compose up --build`. Балансировка проверена: при многократных запросах `curl http://localhost/` ответы поочерёдно приходят от backend-1 и backend-2. При остановке одного backend-контейнера Nginx автоматически перестаёт направлять на него трафик (благодаря настройкам `max_fails` и `fail_timeout` в nginx.conf), и все запросы обслуживаются оставшимся сервером. После повторного запуска контейнера балансировка восстанавливается.

```bash
cd book23/shop-API/load-balancing
docker compose up --build
```
---
