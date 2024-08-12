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
            { role: "employee", email: employee.email }, 
            "jwt_secret_key", 
            { expiresIn: "1d" }
          );
          res.cookie('token', token);
          return res.json({ loginStatus: true });
        } else {
          return res.json({ loginStatus: false, message: "wrong email or password" });
        }
      });
    } else {
      return res.json({ loginStatus: false, message: "wrong email or password" });
    }
  });
});

export { router as EmployeeRoute };
