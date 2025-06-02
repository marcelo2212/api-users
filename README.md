# API de Usuários - NestJS

Este projeto é uma API robusta para gerenciamento de usuários, construída com foco em performance, segurança e boas práticas de engenharia de software.

---

## Tecnologias Utilizadas

- **NestJS** – Framework principal
- **TypeORM** – ORM para PostgreSQL
- **PostgreSQL** – Banco de dados relacional
- **Redis** – Cache para consultas de usuários
- **JWT** – Autenticação segura com access e refresh tokens
- **Winston** – Logs estruturados e contextualizados
- **Jest** – Testes unitários e end-to-end (E2E)

---

## Requisitos

- Node.js v18+
- PostgreSQL
- Redis
- Yarn ou NPM

---

## Instalação

```bash
git clone https://github.com/marcelo2212/api-users
cd api-users
npm install
```

### Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
PORT=3000

# JWT
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_SECRET=sua_chave_secreta_refresh

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=api_users

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Execução do Projeto

```bash
npm run start:dev
```

A API estará disponível em: `http://localhost:3000`

---

## Estrutura de Pastas

```text
src/
├── auth/                          # Módulo de autenticação
│   ├── __tests__/                # Testes unitários do auth
│   ├── controller/
│   │   └── auth.controller.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── refresh-token.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── jwt.strategy.ts
│   └── auth.module.ts
│
├── common/                        # Utilitários e middlewares globais
│   ├── __tests__/
│   │   ├── http-exception.filter.spec.ts
│   │   └── logging.interceptor.spec.ts
│   ├── filters/
│   │   ├── filters.module.ts
│   │   └── http-exception.filter.ts
│   ├── interceptos/               # Interceptadores (ex: logging)
│   │   └── logging.interceptor.ts
│   ├── logger/
│   │   └── winston-logger.service.ts
│   └── util/
│       ├── __tests__/
│       ├── mask-email.util.ts
│       └── safe-log.util.ts
│
├── redis/                         # Integração com Redis
│
├── users/                         # Módulo de usuários
│   ├── controller/
│   ├── dto/
│   ├── entities/
│   └── services/
│
├── test/
│   └── auth-users.e2e-spec.ts     # Testes end-to-end (Jest E2E)
│
├── app.module.ts
└── main.ts                        # Bootstrap da aplicação
```

---

## Scripts

```bash
npm run start         # Compila e executa em modo produção
npm run start:dev     # Executa em modo desenvolvimento (hot reload)
npm run test          # Executa testes unitários
npm run test:watch    # Executa testes unitários em modo contínuo
npm run test:e2e      # Executa testes end-to-end
```

---

## Testes

### Testes Unitários

Executar todos os testes:

```bash
npm run test
```

Modo contínuo (watch):

```bash
npm run test:watch
```

---

### Testes End-to-End (E2E)

Certifique-se de que **PostgreSQL** e **Redis** estejam em execução.

```bash
npm run test:e2e
```

Ou execute diretamente:

```bash
npx jest test/auth-users.e2e-spec.ts --config jest-e2e.json
```

---

## Logs

- Logs estruturados via **Winston**
- Contextualização por módulo
- Níveis: `info`, `warn`, `error`

---

## Funcionalidades da API

- Login com e-mail e senha
- Geração e renovação de accessToken e refreshToken
- Atualização de dados do usuário
- Listagem e detalhes de usuários
- Logout com revogação de token
- Proteção de rotas com `JWT` (Bearer)

---

## Observações

- Access tokens expiram em 15 minutos.
- Refresh tokens expiram em 7 dias.
- Redis é utilizado para cachear e consultar usuários de forma performática.
- Testes E2E cobrem os fluxos críticos de autenticação e usuários.
