# 🚀 URGENT-2KAY Backend

An E-commerce web app backend for creating payment requests, bundling bills, collecting payments via Paystack, and making secure bulk transfers to multiple service providers.  
**Stack:** Node.js · TypeScript · Express · Prisma · PostgreSQL · Solidity (optional on-chain proofs)

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Scripts](#scripts)
7. [API Reference](#api-reference)
8. [Smart Contract Layer (Optional)](#smart-contract-layer-optional)
9. [Development Guide](#development-guide)
10. [Contributing](#contributing)
11. [Credits](#credits)

---

## Project Overview

Urgent2Kay goes beyond traditional bill payment platforms by:
- Bundling multiple bills into one request.
- Holding payments in escrow.
- Using AI-optimized bulk transfers to pay all service providers in a single click.
- Providing on-chain proofs for payment transparency (optional).

**Core workflow:**  
`Auth → Bill Creation → Bundle → Email Notification → Checkout → Accept Payment (Paystack) → Bulk Transfer`

---

## Tech Stack

| Layer              | Tooling / Libraries                                                   |
|--------------------|-----------------------------------------------------------------------|
| **Backend**        | Node.js 20 · TypeScript · Express · Prisma ORM · PostgreSQL           |
| **Payments**       | Paystack REST APIs (single & bulk)                                    |
| **Smart Contracts**| Solidity (Hardhat) · Ethers.js (on-chain proofs – optional)           |
| **Auth & Security**| bcrypt · JWT · Helmet · CORS                                          |
| **Dev Experience** | ESLint · Prettier · Husky + lint-staged · GitHub Actions (CI)         |
| **Testing**        | Vitest · Supertest                                                    |

---

## Architecture

```
backend/
├─ src/
│  ├─ controllers/      # Route handlers
│  ├─ services/         # Business logic (Paystack, Prisma)
│  ├─ jobs/             # Cron/queue (e.g., bulk-transfer scheduler)
│  ├─ lib/              # Axios Paystack instance, helpers
│  └─ routes/           # API endpoints
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ contracts/           # Solidity smart contracts (optional)
├─ tests/               # API and integration tests
├─ .env.example
└─ README.md
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- PostgreSQL instance
- (Optional) Hardhat for smart contract proofs

### Quick Start

```bash
# 0. Clone & install dependencies
git clone https://github.com/SAGE-OF-SIX-PATHS/URGENT-2KAY---Directed-Bill-Payment-System.git
cd backend
npm install

# 1. Set up environment variables
cp .env.example .env
# ...edit .env with your DATABASE_URL, PAYSTACK_SECRET_KEY, JWT_SECRET, etc.

# 2. Prepare the database
npx prisma db push      # For schema setup
npm run seed            # (optional) Seed sample data

# 3. Start Development Server
npm run dev             # Uses ts-node-dev for hot reload

# 4. Run Tests
npm run test
```

---

## Environment Variables

Copy `.env.example` and fill in required keys:

- `DATABASE_URL` - PostgreSQL connection string
- `PAYSTACK_SECRET_KEY` - Paystack API key
- `JWT_SECRET` - for JWT authentication
- ...others as needed for emailing, blockchain, etc.

---

## Scripts

| Script                  | Description                        |
|-------------------------|------------------------------------|
| `npm run dev`           | Development with auto-reload       |
| `npm run build`         | Compiles TypeScript to `dist`      |
| `npm run start`         | Runs compiled server               |
| `npm run prisma:studio` | Opens Prisma Studio DB explorer    |
| `npm run test`          | Runs API and integration tests     |

---

## API Reference

- **Base URL:** `https://urgent-2kay-directed-bill-payment-system-rss6.onrender.com`
- **Auth:** All protected routes require `Authorization: Bearer <JWT>`

### Auth

| Method | Route            | Body                                  | Response  |
|--------|------------------|---------------------------------------|-----------|
| POST   | `/auth/register` | `{ name, email, password, role }`     | JWT Token |
| POST   | `/auth/login`    | `{ email, password }`                 | JWT Token |
| POST   | `/auth/logout`   | -                                     | 200 OK    |

### Bills

| Method | Route                          | Description                        |
|--------|------------------------------- |------------------------------------|
| POST   | `/api/bills`                   | Create a bill                      |
| GET    | `/api/bills`                   | Get all bills (with filters)       |
| GET    | `/api/bills/:id`               | Get bill by ID                     |
| PUT    | `/api/bills/:id`               | Update a bill                      |
| DELETE | `/api/bills/:id`               | Delete a bill                      |
| POST   | `/api/bills/:billId/sponsor`   | Sponsor a bill                     |
| POST   | `/api/bills/blockchain`        | Create blockchain-specific bill    |

### Transactions

| Method | Route                          | Description                        |
|--------|------------------------------- |------------------------------------|
| POST   | `/transaction/transfer`        | Single transfer via Paystack        |
| POST   | `/transaction/accept-payment`  | Initiate payment (Paystack)         |
| POST   | `/transaction/airtime`         | Buy airtime                         |

### Bulk Flow

| Method | Route                          | Description                        |
|--------|------------------------------- |------------------------------------|
| POST   | `/api/recipients/bulk`         | Register multiple recipients        |
| POST   | `/api/bulk-transfer`           | Execute bulk transfer               |

**Full API documentation:** See [`docs/API.md`](./docs/API.md)

---

## Smart Contract Layer (Optional)

- Solidity contract (`contracts/BundleEscrow.sol`) provides on-chain bundle payment proofs.
- Deployed on Polygon Amoy (testnet).
- Backend signs and sends hash after successful Paystack webhook.

**Dev commands:**
```bash
cd contracts
npx hardhat test
npx hardhat run scripts/deploy.ts --network amoy
```

---

## Development Guide

- Use **Conventional Commits** for git messages.
- Lint and test before PRs: `npm run lint && npm run test`
- All bill operations require authentication; bills are linked to the current user via `req.user?.id`.
- All bill endpoints have been consolidated under `/api/bills`.
- Blockchain bill creation and sponsorship supported.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Commit using [Conventional Commits](https://www.conventionalcommits.org/).
3. Lint and test your code.
4. Push and open a PR to the `develop` branch.
5. Resolve conflicts and squash-merge.

---

## Credits

Built by **Learnable 24 group2 interns** and the open-source community.  
Special thanks to Paystack DevRel and all contributors!

---

<p align="center">
  <b>Happy coding! 🎉</b>
</p>

---

Let me know if you’d like to tailor any section or add further details!
