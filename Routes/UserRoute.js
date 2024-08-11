import express from 'express';
import pool from '../utils/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Admin Routes

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

// Category Routes

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

// Employee Routes

router.get('/employee', (req, res) => {
  const sql = `
    SELECT e.id, e.name, e.email, e.salary, e.address, c.name as category_name
    FROM employees e
    JOIN categories c ON e.category_id = c.id
  `;
  pool.query(sql, (err, result) => {
    if (err) {
      console.error("Error getting employees:", err);
      return res.status(500).json({ Status: false, Message: err.message });
    }
    return res.json({ Status: true, Result: result.rows });
  });
});

router.post('/add_employee', upload.single('image'), (req, res) => {
  const { name, email, password, address, salary, category_id } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !email || !password || !address || !salary || !category_id) {
    return res.status(400).json({ Status: false, message: 'Todos os campos são obrigatórios.' });
  }

  const sql = "INSERT INTO employees (name, email, password, address, salary, image, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id";

  bcrypt.hash(password.toString(), 10, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ Status: false, message: err.message });
    }

    const values = [name, email, hash, address, salary, image, category_id];

    pool.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting employee:", err);
        return res.status(500).json({ Status: false, message: err.message });
      }

      if (result.rows.length > 0) {
        return res.json({ Status: true, message: 'Empregado adicionado com sucesso', id: result.rows[0].id });
      } else {
        return res.status(500).json({ Status: false, message: "Erro ao inserir o empregado." });
      }
    });
  });
});

router.get('/employee/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employees WHERE id = $1";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error getting employee:", err);
      return res.status(500).json({ Status: false, Message: err.message });
    }
    if (result.rows.length > 0) {
      return res.json({ Status: true, Result: result.rows[0] });
    } else {
      return res.status(404).json({ Status: false, message: "Empregado não encontrado." });
    }
  });
});

router.put('/edit_employee/:id', (req, res) => {
  const id = req.params.id;
  const { name, email, address, salary, category_id } = req.body;
  const sql = "UPDATE employees SET name = $1, email = $2, address = $3, salary = $4, category_id = $5 WHERE id = $6 RETURNING id";
  pool.query(sql, [name, email, address, salary, category_id, id], (err, result) => {
    if (err) {
      console.error("Error updating employee:", err);
      return res.status(500).json({ Status: false, message: err.message });
    }
    if (result.rows.length > 0) {
      return res.json({ Status: true, message: 'Empregado atualizado com sucesso', id: result.rows[0].id });
    } else {
      return res.status(404).json({ Status: false, message: "Empregado não encontrado." });
    }
  });
});

router.delete('/delete_employee/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM employees WHERE id = $1 RETURNING id";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting employee:", err);
      return res.status(500).json({ Status: false, message: err.message });
    }
    if (result.rows.length > 0) {
      return res.json({ Status: true, message: 'Empregado excluído com sucesso', id: result.rows[0].id });
    } else {
      return res.status(404).json({ Status: false, message: "Empregado não encontrado." });
    }
  });
});


export { router as UserRoute };
