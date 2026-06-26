import express from "express";
import cors from "cors";
import morgan from "morgan";

import routes from "./src/routes/index.js";

const app = express();

// Middlewares
app.use(cors());

app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// Static Folder
app.use("/uploads", express.static("src/uploads"));

// Routes
app.use("/api", routes);

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

export default app;