import { VehicleService } from '../services/vehicleService.js';

export class VehicleController {
  static async getAll(req, res, next) {
    try {
      const vehicles = await VehicleService.getAllVehicles(req.query);
      res.json({ success: true, data: vehicles });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const vehicle = await VehicleService.getVehicleById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }
      res.json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  static async getAvailable(req, res, next) {
    try {
      const vehicles = await VehicleService.getAvailableVehicles();
      res.json({ success: true, data: vehicles });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const created = await VehicleService.createVehicle(req.body, req.user?.id);
      res.status(201).json({ success: true, message: 'Vehicle registered successfully', data: created });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updated = await VehicleService.updateVehicleStatus(req.params.id, status, req.user?.id);
      res.json({ success: true, message: 'Vehicle status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }
}
