import express from 'express';
import pool from '../utils/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Employee Routes
router.post('/employee_login', (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM employees WHERE email = $1";
  
  pool.query(query, [email], (err, result) => {
    if (err) {
      return res.json({ loginStatus: false, message: err.message });
    }
    if (result.rows.length > 0) {
      const employee = result.rows[0];
      bcrypt.compare(password, employee.password, (err, isMatch) => {
        if (err) {
          return res.json({ loginStatus: false, message: err.message });
        }
        if (isMatch) {
          const token = jwt.sign(
            { role: "employee", email: employee.email, id: employee.id },
            "jwt_secret_key", 
            { expiresIn: "1d" }
          );
          res.cookie('token', token);
          return res.json({ loginStatus: true, id: employee.id });
        } else {
          return res.json({ loginStatus: false, message: "wrong email or password" });
        }
      });
    } else {
      return res.json({ loginStatus: false, message: "wrong email or password" });
    }
  });
});

router.get('/details/:id', (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM employees WHERE id = $1";
  
  pool.query(query, [id], (err, result) => {
    if (err) {
      return res.json({ Status: false, message: err.message });
    }
    return res.json({ Status: true, Result: result.rows[0] });
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ Status: true, message: 'Sessão encerrada com sucesso' });
});


export { router as EmployeeRoute };
