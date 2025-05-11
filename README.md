<h1 align=center>URGENT2KAY</h1>
 <h2 align=center>URGENT-2KAY---Directed-Bill-Payment-System for accountability and ease of payment</h2>

A robust Node.js backend built with TypeScript, Express, and MongoDB, designed for modern e-commerce applications.

## 🛠 Technologies Used
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express
- **Database**: MongoDB (with Mongoose ODM)
- **API Documentation**: (Add Swagger/Postman link if applicable)
- **Authentication**: JWT
- **Environment Management**: Dotenv
- **Testing**: Jest (optional)
- **Validation**: Zod

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
   D --> E[Database/External APIs]
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
├── models/         # Mongoose models
│   ├── emailModel.ts
├── controllers/    # Business logic
│   ├── acceptPayment.ts
│   ├── transfer.controller.ts
│   └── airtime.controller.ts
├── services/       # Reusable logic (paystack)
│   └── email.service.ts
├── routes/         # API endpoints
│   ├── emailRoutes.ts
│   └── paymentroutes.ts
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
   Create `.env` file:
   ```env
   
   PORT=5000
   ```

3. **Run the server**
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

## 🔗Endpoints
Paystack Payment Gateway was used for the payment features
BaseURL: https://urgent-2kay-directed-bill-payment-system-rss6.onrender.com
- `POST /api/email/send-email
- `POST /transaction/accept-payment
- `GET /transaction/airtime
- `POST /transaction/transfer

## 🛡️ Key Features
- Type-safe codebase
- JWT authentication
- Graceful shutdown
- Environment validation
- Ready for CI/CD integration

> **Note**: Add your specific API documentation link here when available.
```
