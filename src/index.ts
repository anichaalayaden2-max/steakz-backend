import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import menuItemRoutes from "./routes/menuItemRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Steakz MIS API Running 🚀",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/branches", branchRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/menu-items", menuItemRoutes);

app.use("/api/orders", orderRoutes);


app.use("/api/payments", paymentRoutes);

app.use("/api/receipts", receiptRoutes);

app.use("/api/users", userRoutes);

app.use("/api/tables", tableRoutes);

app.use("/api/reservations", reservationRoutes);

app.use("/api/dashboard", dashboardRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});