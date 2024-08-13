import express from 'express';
import { UserRoute } from './Routes/UserRoute.js';
import { EmployeeRoute } from './Routes/EmployeeRoute.js';
import cors from 'cors';
import path from 'path';
import Jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/auth', UserRoute);
app.use('/employee', EmployeeRoute);

// const verifyUser = (req, res, next) => {
//   const token = req.cookies.token;
//   if (token) {
//     Jwt.verify(token, "jwt_secret_key", (err, decoded) => {
//       if (err) {
//         return res.status(401).json({ Status: false, message: 'Você não está autenticado' });
//         req.id = decoded.email;
//         req.role = decoded.role;
//         next();
//       }
//       next();
//     });
//   } else {
//     return res.status(401).json({ Status: false, message: 'Você não está autenticado' });
//   }
// };

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if(token) {
      Jwt.verify(token, "jwt_secret_key", (err ,decoded) => {
          if(err) return res.json({Status: false, Error: "Wrong Token"})
          req.id = decoded.id;
          req.role = decoded.role;
          next()
      })
  } else {
      return res.json({Status: false, Error: "Not autheticated"})
  }
}
app.get('/verify',verifyUser, (req, res)=> {
  return res.json({Status: true, role: req.role, id: req.id})
} )


app.use('/images', express.static(path.join(process.cwd(), 'Public', 'Images')));

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
