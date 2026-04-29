# Практическое задание №23: Контейнеризация приложений с Docker

## 1. Запуск (WSL – терминал Ubuntu)

### 1.1 Перейти в папку проекта (диск Windows доступен через /mnt/c/)

```bash
cd "/mnt/c/book23/shop-API/load-balancing"
```
### 1.2 Запуск контейнеров

```bash
docker compose up --build
```

### 1.3 Проверка балансировки (round‑robin)

```bash
curl http://localhost/
```

### 1.4 Проверка отказоустойчивости

####  Остановка одного backend-сервера

```bash
docker compose stop backend1
```

#### Проверка балансировки (round‑robin)

```bash
curl http://localhost/
```

> Все последующие ответы будут только от backend-2.

####  Запуск сервера снова

```bash
docker compose start backend1
```

> Балансировка между backend-1 и backend-2 восстановится.

### 1.5 Остановка

```bash
docker compose down
```


## 2. Запуск и проверка CMD

### 2.1 Перейти в папку проекта

```bash
cd book23\shop-API\load-balancing
```
### 2.2 Запуск контейнеров

```bash
docker compose up --build
```

### 2.3 Проверка балансировки (round‑robin)

```bash
curl http://localhost/
```

### 2.4 Проверка отказоустойчивости

####  Остановка одного backend-сервера

```bash
docker compose stop backend1
```

#### Проверка балансировки (round‑robin)

```bash
curl http://localhost/
```

> Все последующие ответы будут только от backend-2.

####  Запуск сервера снова

```bash
docker compose start backend1
```

> Балансировка между backend-1 и backend-2 восстановится.

### 2.5 Остановка

```bash
docker compose down
```