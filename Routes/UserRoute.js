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
      return res.json({ loginStatus: false, message: "wrong email or password" });
    }
  });
});

router.get('/category', (req, res) => {
  const sql = "SELECT * FROM categories";
  pool.query(sql, (err, result) => {
    if (err) {
      console.error("Error getting categories:", err);
      return res.status(500).json({ Status: false, Message: err.message });
    }
    return res.json({ Status: true, Result: result.rows });
  });
});

router.post('/add_category', (req, res) => {
  const sql = "INSERT INTO categories (name) VALUES ($1) RETURNING id";
  pool.query(sql, [req.body.name], (err, result) => {
    if (err) {
      console.error("Error inserting category:", err);
      return res.status(500).json({ Status: false, message: err.message });
    }
    if (result.rows.length > 0) {
      return res.json({ Status: true, message: 'Categoria adicionada com sucesso', id: result.rows[0].id });
    } else {
      return res.status(500).json({ Status: false, message: "Erro ao inserir a categoria." });
    }
  });
});

export { router as UserRoute };
