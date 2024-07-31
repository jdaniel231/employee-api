import express from "express";
import { UserRoute } from "./Routes/UserRoute.js";
import cors from 'cors';

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // Remover a barra final
  methods: ["GET", "POST", "PUT"],
  credentials: true
}));
app.use(express.json());
app.use('/auth', UserRoute);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
