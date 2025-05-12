<h1 align=center>URGENT2KAY</h1>
 <h2 align=center>URGENT-2KAY---Directed-Bill-Payment-System for accountability and ease of payment</h2>

A robust Node.js backend built with TypeScript, Express, and MongoDB, designed for modern e-commerce applications with blockchain integration for crypto payments.

## 🛠 Technologies Used
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express
- **Database**: MongoDB (with Mongoose ODM), PostgreSQL (with Prisma)
- **API Documentation**: (Add Swagger/Postman link if applicable)
- **Authentication**: JWT
- **Environment Management**: Dotenv
- **Testing**: Jest (optional)
- **Validation**: Zod
- **Blockchain**: Ethereum (ethers.js, web3.js)

## 🌐 Service Flow
1. **Request Entry**  
   → Hits `server.ts`  
   → Initializes app via `createApp()`

2. **App Initialization**  
   → Connects to MongoDB  
   → Loads middleware (CORS, JSON parsing)  
   → Registers routes

3. **Route Handling**  
   ```mermaid
   graph LR
   A[API Request] --> B[Route]
   B --> C[Controller]
   C --> D[Service Layer]
   D --> E[Database/External APIs/Blockchain]
   ```

4. **Response**  
   → Structured JSON responses  
   → Error handling middleware

## 📂 Project Structure
```
src/
├── config/         # Environment/configs
│   └── paystack.ts
│   ├── smtp.config.ts
│   ├── blockchain.ts
├── models/         # Mongoose models
│   ├── emailModel.ts
├── controllers/    # Business logic
│   ├── acceptPayment.ts
│   ├── transfer.controller.ts
│   ├── airtime.controller.ts
│   ├── blockchain.controller.ts
├── services/       # Reusable logic (paystack, blockchain)
│   └── email.service.ts
│   └── blockchain.service.ts
├── routes/         # API endpoints
│   ├── emailRoutes.ts
│   ├── paymentroutes.ts
│   ├── blockchain.routes.ts
├── middlewares/    # Auth, validation
│   ├── emailErrorMiddleware.ts
│   └── ErrorLoggerMiddleware.ts
├── utils/          # Helpers, error handlers
│   ├── env.ts
│   ├── errorHandler.ts
│   ├── getBankCode.ts
│   └── payment.util.ts
├── types/          # Custom TS types
└── app.ts          # Express setup
server.ts           # Entry point
```

## 🚀 Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**  
   Create `.env` file based on the `.env.example`:
   ```env
   PORT=5000
   
   # Database connection
   DATABASE_URL=your_database_url
   
   # Blockchain configuration
   RPC_URL=your_ethereum_rpc_url
   CHAIN_ID=11155111
   U2K_TOKEN_CONTRACT_ADDRESS=your_token_contract_address
   BILL_PAYMENT_CONTRACT_ADDRESS=your_bill_payment_contract_address
   BLOCKCHAIN_PRIVATE_KEY=your_private_key
   ```

3. **Run the server**
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

## 🔗Endpoints
Paystack Payment Gateway was used for the payment features
BaseURL: https://urgent-2kay-directed-bill-payment-system-rss6.onrender.com

### Standard Payment Endpoints
- `POST /api/email/send-email`
- `POST /transaction/accept-payment`
- `GET /transaction/airtime`
- `POST /transaction/transfer`

### Blockchain Payment Endpoints
- `POST /blockchain/wallets/:userId` - Create a crypto wallet for a user
- `GET /blockchain/wallets/:userId/balance` - Get a user's token balance
- `POST /blockchain/bills/:billId/request` - Create a bill payment request on blockchain
- `POST /blockchain/blockchain-requests/:blockchainRequestId/pay-native` - Pay a bill with native tokens (ETH)
- `POST /blockchain/blockchain-requests/:blockchainRequestId/pay-u2k` - Pay a bill with U2K tokens
- `POST /blockchain/blockchain-requests/:blockchainRequestId/reject` - Reject a bill
- `GET /blockchain/blockchain-bills/:blockchainBillId` - Get bill details from blockchain
- `GET /blockchain/beneficiary-bills/:address` - Get bills for a beneficiary
- `GET /blockchain/sponsor-bills/:address` - Get bills for a sponsor

## 🛡️ Key Features
- Type-safe codebase
- JWT authentication
- Graceful shutdown
- Environment validation
- Ready for CI/CD integration
- Blockchain integration for crypto payments
- Dual database support (MongoDB and PostgreSQL)

## 🔒 Blockchain Security
- Private keys should never be stored in the database
- For production, use a secure wallet provider or HSM
- All blockchain transactions are recorded in the database for auditing

> **Note**: Add your specific API documentation link here when available.
```