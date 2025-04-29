// src/server.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes';
import paymentRoutes from './routes/paymentRoutes';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Finance Backend is Running!');
});

// app.get('/', (req, res) => {
//   res.send('Finance Backend is Running!');
// });

// Example route for testing
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Finance Backend API',
        version: '1.0.0',
        description: 'API Documentation for Urgent 2kay'
      }
    },
    apis: ['./src/routes/*.ts']
  };
  
  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/payment', paymentRoutes);
