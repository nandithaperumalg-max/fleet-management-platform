import { MaintenanceService } from '../services/maintenanceService.js';
import { runFleetMaintenanceEvaluation } from '../engine/maintenanceEngine.js';

export class MaintenanceController {
  static async getAllWorkOrders(req, res, next) {
    try {
      const orders = await MaintenanceService.getAllWorkOrders(req.query);
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  static async getWorkOrderById(req, res, next) {
    try {
      const order = await MaintenanceService.getWorkOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Work order not found' });
      }
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  static async createWorkOrder(req, res, next) {
    try {
      const created = await MaintenanceService.createWorkOrder(req.body, req.user?.id, req);
      res.status(201).json({ success: true, message: 'Work order scheduled successfully', data: created });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const updated = await MaintenanceService.updateWorkOrderStatus(req.params.id, req.body, req.user?.id, req);
      res.json({ success: true, message: 'Work order updated successfully', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async getParts(req, res, next) {
    try {
      const parts = await MaintenanceService.getSparePartsInventory();
      res.json({ success: true, data: parts });
    } catch (err) {
      next(err);
    }
  }

  static async triggerEvaluation(req, res, next) {
    try {
      await runFleetMaintenanceEvaluation();
      res.json({ success: true, message: 'Maintenance evaluation completed successfully.' });
    } catch (err) {
      next(err);
    }
  }
}
