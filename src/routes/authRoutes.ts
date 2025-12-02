import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sql from "mssql";
import { getPool } from "../db/config";

const router = express.Router();

// REGISTER USER
router.post("/register", async (req, res) => {
  const { full_name, email, phone, role, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await getPool();

    const existing = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM UserAccount WHERE email = @email");

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    await pool
      .request()
      .input("full_name", sql.VarChar, full_name)
      .input("email", sql.VarChar, email)
      .input("phone", sql.VarChar, phone)
      .input("role", sql.VarChar, role)
      .input("password_hash", sql.VarChar, hashedPassword)
      .query(
        `INSERT INTO UserAccount (full_name, email, phone, role, password_hash)
         VALUES (@full_name, @email, @phone, @role, @password_hash)`
      );

    return res.status(201).json({ message: "User registered successfully!" });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM UserAccount WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // Return token in response body (for localStorage)
    return res.status(200).json({
      message: "Login successful",
      token, 
      user: {
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT 
router.post("/logout", (req, res) => {
  // Only useful if using cookies (not needed for localStorage)
  return res.status(200).json({ message: "Logged out successfully" });
});

export default router;
