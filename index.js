import express from 'express';
import { UserRoute } from './Routes/UserRoute.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsPath = path.resolve(__dirname, '../server/Uploads');

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use('/auth', UserRoute);
app.use('/uploads', express.static(uploadsPath));

// Rota para listar arquivos (depuração)
app.get('/list-uploads', (req, res) => {
  const fs = import('fs');
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return res.status(500).json({ Status: false, message: err.message });
    }
    res.json({ Status: true, files });
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
