import express from 'express';
import { UserRoute } from './Routes/UserRoute.js';
import { EmployeeRoute } from './Routes/EmployeeRoute.js';
import cors from 'cors';
import path from 'path';

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use('/auth', UserRoute);
app.use('/employee', EmployeeRoute);

// Ajuste o caminho da pasta 'Public/Images' para 'public/images'
app.use('/images', express.static(path.join(process.cwd(), 'Public', 'Images')));

// Rota para listar arquivos (depuração)
app.get('/list-images', (req, res) => {
  import('fs').then(fs => {
    const imagesPath = path.join(process.cwd(), 'Public', 'Images');
    fs.readdir(imagesPath, (err, files) => {
      if (err) {
        console.error("Error reading images directory:", err);
        return res.status(500).json({ Status: false, message: err.message });
      }
      res.json({ Status: true, files });
    });
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
