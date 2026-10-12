import { AuthService } from '../services/authService.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
      }
      const result = await AuthService.login(username, password);
      res.json({ success: true, message: 'Login successful', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async getDrivers(req, res, next) {
    try {
      const drivers = await AuthService.getDrivers();
      res.json({ success: true, data: drivers });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res) {
    res.json({ success: true, user: req.user });
  }
}
