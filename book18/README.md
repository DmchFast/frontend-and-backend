# Практическое задание №18: Отчёт по всей работе

[![HTML5](https://img.shields.io/badge/HTML5-E34C26?style=for-the-badge&logo=html5&logoColor=E34C26&label=HTML&labelColor=303030)]()
[![Nodejs](https://img.shields.io/badge/24.13.1-3C873A?style=for-the-badge&logo=node.js&label=Node.js&labelColor=303030&logoColor=3C873A)]()
[![Express](https://img.shields.io/badge/5.2.1-404d59?style=for-the-badge&logo=express&logoColor=58b7d3&label=Express.js&labelColor=303030)]()
[![Socket.io](https://img.shields.io/badge/4.8.3-black?style=for-the-badge&logo=socket.io&label=Socket.IO&labelColor=303030&logoColor=white)]()
[![PWA](https://img.shields.io/badge/Progressive_Web_App-5A0FC8?style=for-the-badge&logo=pwa&logoColor=5A0FC8&label=PWA&labelColor=303030&color=5A0FC8)](https://web.dev/progressive-web-apps/)
[![JavaScript](https://img.shields.io/badge/ES6+-F7DF1E?style=for-the-badge&logo=javascript&label=JavaScript&labelColor=303030)]()

## Структура проекта

```
frontend-and-backend/
├── book13/          # Service Worker
├── book14/          # Web App Manifest
├── book15/          # HTTPS + App Shell
├── book16/          # WebSocket + Push
├── book17/          # Детализация Push
├── book18/          # Отчёт по 13-18 book
└── README.md
```

---

## Практическое задание №13: Service Worker

Реализация базового офлайн-функционала для приложения управления списком дел.

**Технологии:** HTML, JS (Service Worker API), Cache API, localStorage

**Файлы:** `book13/app.js`, `book13/index.html`, `book13/sw.js`

**Результат:** Приложение кэширует статические ресурсы и остается работоспособным при отсутствии интернет-соединения.

### Запуск

```bash
cd book13
npx live-server
# → http://127.0.0.1:8080/
```

---

## Практическое задание №14: Web App Manifest

Настройка метаданных для превращения веб-приложения в прогрессивное веб-приложение (PWA).

**Технологии:** JSON (Manifest), PWA Metadata

**Файлы:** `book14/`

**Результат:** Добавлена возможность установки приложения на рабочий стол (A2HS), настроены иконки, цвета темы и режим отображения `standalone`.

### Запуск

```bash
cd book14
npx live-server
# → http://127.0.0.1:8080/
```

---

## Практическое задание №15: HTTPS + App Shell

Обеспечение безопасности и проектирование архитектуры мгновенной загрузки интерфейса.

Инструкция и информация как установить Chocolatey тут -> [`CHOCOLATEY_AND_MKCERT.md`](/book15/CHOCOLATEY_AND_MKCERT.md)

**Технологии:** HTTPS (самоподписанные сертификаты), App Shell Architecture

**Файлы:** `book15/`

**Результат:** Реализовано разделение на статический каркас (App Shell) и динамический контент. Настроена стратегия кэширования `Network First` для актуальных данных.

### Запуск

Запуск производится при помощи команды `npm run http-server`, которая внесена в `package.json`, информация тут -> [`CHOCOLATEY_AND_MKCERT.md`](/book15/CHOCOLATEY_AND_MKCERT.md)

```bash
cd book15
npm run http-server
# → https://127.0.0.1:3000 или http://localhost:3000
```

---

## Практическое задание №16: WebSocket + Push

Интеграция двусторонней связи в реальном времени и системы уведомлений.

**Технологии:** Socket.IO, Web Push API, VAPID, Node.js (Express)

**Файлы:** `book16/`

**Результат:** Реализовано мгновенное обновление списка задач через WebSocket и отправка системных Push-уведомлений при добавлении новых записей.

```bash
cd book16
npm npm start
# → http://localhost:3001
```

или

```bash
cd book16
node server.js
# → http://localhost:3001
```

---

## Практическое задание №17: Детализация Push

Реализация расширенной логики уведомлений с возможностью планирования.

**Технологии:** Web-push (библиотека Node.js), Service Worker Actions

**Файлы:** `book17/`

**Результат:** Добавлена форма создания заметок с указанием времени напоминания. Реализована обработка действий в уведомлении (кнопка «Отложить на 5 минут») через Service Worker.

```bash
cd book17
npm npm start
# → http://localhost:3001
```

или

```bash
cd book17
node server.js
# → http://localhost:3001
```

---

### Общая функциональность итогового PWA

- **Офлайн-режим:** Полная работа интерфейса без сети благодаря Service Worker.
- **Установка:** Приложение устанавливается как нативно на мобильные устройства и ПК.
- **Real-time:** Мгновенная синхронизация событий между вкладками через Socket.IO.
- **Умные уведомления:** Серверное планирование Push-сообщений и интерактивное управление ими через шторку уведомлений ОС.
- **Безопасность:** Работа всех современных браузерных API через защищенное соединение HTTPS.

**Технологии:** HTML, Node.js, Express, Socket.IO, Service Workers, Web Push, PWA.

---