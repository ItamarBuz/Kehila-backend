import express from "express";
import authRoutes from "./routes/authRoutes";
import donationRoutes from "./routes/donationRoutes";

const app = express();

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api", donationRoutes);

export default app;
