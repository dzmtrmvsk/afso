# AFSO — Adaptive Field Service Orchestrator

SaaS-платформа для управления полевыми бригадами. Автоматическое распределение заявок, SLA-мониторинг, realtime-уведомления.

## Технологический стек

| Слой | Технология |
|---|---|
| Backend | NestJS (Node.js 20+) |
| Frontend | React + Vite + MUI |
| БД (реляционная) | PostgreSQL 16 |
| БД (event-store) | MongoDB 7 |
| Кэш / Очереди | Redis 7 + BullMQ |
| WebSockets | Socket.IO |
| Инфраструктура | Docker Compose |

## Быстрый старт

### 1. Клонировать и настроить окружение

```bash
cp .env.example .env
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Запустить инфраструктуру (БД, Redis)

```bash
# Только базы данных и Redis
npm run docker:up

# С pgAdmin и Mongo Express (dev tools)
docker compose --profile tools up -d
```

### 4. Запустить приложения локально

```bash
# Все приложения (API + Web)
npm run dev

# Или по отдельности
npm run dev:api
npm run dev:web
```

### 5. Запустить всё в Docker (включая API и Web)

```bash
docker compose up -d
```

## Порты

| Сервис | Порт |
|---|---|
| API (NestJS) | 3000 |
| Web (Vite) | 5173 |
| PostgreSQL | 5433 |
| MongoDB | 27018 |
| Redis | 6380 |
| pgAdmin | 5050 |
| Mongo Express | 8082 |

## Структура проекта

```
afso/
├── apps/
│   ├── api/          # NestJS backend
│   │   └── src/
│   │       ├── core/       # guards, filters, interceptors
│   │       ├── infra/      # database, queue, config
│   │       └── features/   # users, tickets, sla
│   └── web/          # React + Vite frontend
│       └── src/
│           └── theme/
├── packages/
│   └── shared/       # shared types, enums, constants
├── docker-compose.yml
└── turbo.json
```

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск всех приложений в dev-режиме |
| `npm run build` | Сборка всех приложений |
| `npm run docker:up` | Поднять Docker-инфраструктуру |
| `npm run docker:down` | Остановить Docker-инфраструктуру |
| `npm run docker:destroy` | Остановить и удалить volumes |
| `npm run docker:logs` | Логи Docker-контейнеров |
