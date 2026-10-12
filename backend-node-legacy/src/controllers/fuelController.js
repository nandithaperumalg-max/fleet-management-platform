import { FuelService } from '../services/fuelService.js';

export class FuelController {
  static async getAll(req, res, next) {
    try {
      const logs = await FuelService.getAllFuelLogs(req.query);
      res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }

  static async logFuel(req, res, next) {
    try {
      const result = await FuelService.logFuelTransaction(req.body, req.user?.id, req);
      res.status(201).json({ success: true, message: 'Fuel transaction recorded', data: result });
    } catch (err) {
      next(err);
    }
  }
}
