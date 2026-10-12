import { AnalyticsService } from '../services/analyticsService.js';

export class AnalyticsController {
  static async getKPIs(req, res, next) {
    try {
      const kpis = await AnalyticsService.getDashboardKPIs();
      res.json({ success: true, data: kpis });
    } catch (err) {
      next(err);
    }
  }

  static async getUtilization(req, res, next) {
    try {
      const data = await AnalyticsService.getUtilizationView();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getUpcomingMaintenance(req, res, next) {
    try {
      const data = await AnalyticsService.getUpcomingMaintenanceView();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getFuelEfficiency(req, res, next) {
    try {
      const data = await AnalyticsService.getFuelEfficiencyView();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
