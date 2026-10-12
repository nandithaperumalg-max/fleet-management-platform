import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { config } from '../config/env.js';

export class AuthService {
  static async login(usernameOrEmail, password) {
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE`,
      [usernameOrEmail, usernameOrEmail]
    );

    if (!rows.length) {
      const err = new Error('Invalid username/email or password');
      err.statusCode = 401;
      throw err;
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid username/email or password');
      err.statusCode = 401;
      throw err;
    }

    // Check if user is a driver
    let driverProfile = null;
    if (user.role === 'DRIVER') {
      const [dRows] = await pool.execute(`SELECT * FROM drivers WHERE user_id = ?`, [user.id]);
      if (dRows.length) driverProfile = dRows[0];
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
        driver_profile: driverProfile
      }
    };
  }

  static async getDrivers() {
    const [rows] = await pool.execute(`
      SELECT d.*, u.full_name, u.email 
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      WHERE d.employment_status = 'ACTIVE'
    `);
    return rows;
  }
}
