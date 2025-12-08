import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes";
import {getPool} from "./db/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import paymentRoutes from "./routes/paymentRoutes"
import marketRoutes from "./routes/marketRoutes"
import farmerRoutes from "./routes/farmerRoutes"
import orderRoutes from "./routes/orderRoutes"
import adminRoutes from "./routes/adminRoutes"

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

  



// Middleware
app.use(express.json());


// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes)
app.use("/api/payment",paymentRoutes )
app.use("/api/market",marketRoutes)
app.use("/api/farmer",farmerRoutes)
app.use("/api/order",orderRoutes)
app.use("/api/admin", adminRoutes)


// Root route
app.get("/", (req: Request, res: Response) => {
  res.send(" Digital Farm Marketplace API is running...");
});

// Start server
app.listen(PORT, async () => {
  try {
    await (getPool)();
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (error) {
    console.error(" Error starting server:", error);
  }
});
