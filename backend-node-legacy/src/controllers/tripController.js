import { TripService } from '../services/tripService.js';

export class TripController {
  static async getAll(req, res, next) {
    try {
      const trips = await TripService.getAllTrips(req.query);
      res.json({ success: true, data: trips });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const trip = await TripService.getTripById(req.params.id);
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Trip not found' });
      }
      res.json({ success: true, data: trip });
    } catch (err) {
      next(err);
    }
  }

  static async dispatch(req, res, next) {
    try {
      const result = await TripService.dispatchTrip(req.body, req.user?.id, req);
      res.status(201).json({ success: true, message: 'Trip dispatched successfully', data: result });
    } catch (err) {
      next(err);
    }
  }

  static async complete(req, res, next) {
    try {
      const result = await TripService.completeTrip(req.params.id, req.body, req.user?.id, req);
      res.json({ success: true, message: 'Trip completed successfully', data: result });
    } catch (err) {
      next(err);
    }
  }
}
