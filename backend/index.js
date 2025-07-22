import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import colors from "colors";
import cors from "cors";
import router from "./routes/authRoutes.js";
import productRouter from "./routes/productRoute.js";
import cookieParser from "cookie-parser";
import clientRoutes from "./routes/clientRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

connectDB();
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Your frontend origin (Vite default)
    credentials: true, // ✅ Allow cookies to be sent
  })
);

app.use(cookieParser());

app.use("/auth", router);
app.use("/products", productRouter);
app.use("/client", clientRoutes);
app.use("/category", categoryRoutes);

app.use("/service", serviceRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is running ${PORT}`.bgCyan.white);
});
