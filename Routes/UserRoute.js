import express from 'express';
import pool from '../utils/db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/adminlogin', (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = $1 AND password = $2";
  
  pool.query(query, [email, password], (err, result) => {
    if (err) {
      return res.json({ loginStatus: false, message: err.message });
    }
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = jwt.sign(
        { role: "admin", email: user.email }, 
        "jwt_secret_key", 
        { expiresIn: "1d" }
      );
      res.cookie('token', token);
      return res.json({ loginStatus: true });
    } else {
      return res.json({ loginStatus: false, message: "Invalid Credentials" });
    }
  });
});

export { router as UserRoute };
