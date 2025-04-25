import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connect } from "./database/connect.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import buffetRoutes from "./routes/buffets.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/buffets", buffetRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/payments", paymentsRoutes);

app.listen(PORT, () => {
  console.log(`A szerver fut a ${PORT} porton`);
  connect();
});
