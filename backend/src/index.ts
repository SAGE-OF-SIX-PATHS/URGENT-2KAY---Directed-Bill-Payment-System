import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import paystackRoutes from "./routes/payment.routes";
import { PORT } from "./config/paystack";
import { emailRouter } from "./routes/emailRoutes";
import { loggerMiddleware } from './middlewares/emailLoggerMiddleware';
import { errorHandler } from './middlewares/emailErrorMiddleware';


const app = express();

app.use(cors({
          origin: 'http://localhost:5000'   
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(loggerMiddleware);

// Routes
app.use('/api/email', emailRouter);
app.use("/transaction", paystackRoutes);

// Error Handling (should be last middleware)
app.use(errorHandler);

app.listen(PORT, () => {
          console.log(`Server running on http://localhost:${PORT}`);
});