import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import paystackRoutes from "./routes/payment.routes";
import { PORT } from "./config/paystack";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/transaction", paystackRoutes);


app.listen(PORT, () => {
          console.log(`Server running on http://localhost:${PORT}`);
});