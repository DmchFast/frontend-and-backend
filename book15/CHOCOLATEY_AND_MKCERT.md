# Устновка Chocolatey (Windows) и mkcert 

## 1. Подготовка к mkcert и установка Chocolatey

### 1.1. Установка Chocolatey (Windows)

Открыть PowerShell или Командную строку (cmd) от имени администратора и выполнить команду:

```bash
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

---

### 1.2. Установка mkcert

В том же окне (от имени администратора) выполнить установку команды:

```bash
choco install mkcert
```
---

### 1.3. Создаёние SSL-сертификатов

SSL-сертификат, который будет работать для разных способов обращения к компьютеру:

```bash
# Создаёт и устанавливает локальный корневой сертификат
mkcert -install

# Создаёт доверенный сертификат для localhost
mkcert localhost 127.0.0.1 ::1 
```
После этого создадутся два файла `localhost+2.pem` и `localhost+2-key.pem`.

---

### 1.4. Добавление скрипта в package.json для быстрого запуска

Открыть package.json и добавить этот скрипт в раздел "scripts":

```bash
{
   "name": "notes-app",
   "scripts": {
      "http-server": "http-server --ssl --cert localhost+2.pem --key localhost+2-key.pem -p 3000"
   }
}
```

---

### 1.5. Запуск

Запуск одной командой:

```bash
npm run http-server 
```
Появятся несколько ссылок, которые отвечают за разное обращение к компьютеру.

---

### 1.6 Способы обращения к компьютеру 
1. `https://xxx.x.x.x:6000` — localhost (IPv4)
   - Локальный адрес, указывает на этот же компьютер.
   - Работает только на собственном компьютере. 
   - Использууется для разработки/тестирования приложений прямо на своём ПК.

2. `https://192.xxx.x.x:6000` — локальная сеть (Wi-Fi/Ethernet)
   - Реальный IP-адрес в домашней/офисной сети.
   - Работает на собственном компьютере и на других    устройствах в той же Wi-Fi сети.
   - Использууется для разработки/тестирования на разных устройствах.

3. `https://192.xxx.xx.x:6000` — VirtualBox/Hyper-V сеть
   - Виртуальный адаптер от VirtualBox или Hyper-V.
   - Работает на собственном компьютере так и виртуальных машинах.
   - Использууется для разработки/тестирования с использованием виртуальных машин (Docker, VirtualBox и т.д.).

4. `https://172.xx.xxx.x:6000` и `https://172.xx.xx.x:6000` — VPN/Docker/Подсистемы
   - Виртуальные адаптеры от: Docker, WSL, VPN, VMware.
   - Работает на собственном компьютере, контейнерах Docker, WSL, Через VPN соединения.
   - Использууется при работе с Docker-контейнерами, WSL или удалённым доступом через VPN.

---
