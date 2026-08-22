import { Request, Response, NextFunction } from 'express';
import { CreateFacilityService } from '../../application/services/facility/create-facility.service.js';
import { GetFacilityService } from '../../application/services/facility/get-facility.service.js';
import { ListFacilitiesService } from '../../application/services/facility/list-facilities.service.js';
import { UpdateFacilityService } from '../../application/services/facility/update-facility.service.js';

export class FacilityController {
  constructor(
    private createFacilityService: CreateFacilityService,
    private getFacilityService: GetFacilityService,
    private listFacilitiesService: ListFacilitiesService,
    private updateFacilityService: UpdateFacilityService
  ) {}

  createFacility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, facility_type, country, region, capacity } = req.body;
      const facility = await this.createFacilityService.execute({
        name,
        facility_type,
        country,
        region,
        capacity
      });
      res.status(201).json(facility);
    } catch (err) {
      next(err);
    }
  };

  getFacility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const facility = await this.getFacilityService.execute({ id });
      if (!facility) {
        return res.status(404).json({ error: 'Not Found', message: 'Facility not found' });
      }
      res.status(200).json(facility);
    } catch (err) {
      next(err);
    }
  };

  listFacilities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.page_size as string, 10) || parseInt(req.query.pageSize as string, 10) || 20;
      const status = req.query.status as string | undefined;

      const result = await this.listFacilitiesService.execute({ page, pageSize, status });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  updateFacility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { name, facility_type, country, region, capacity, status } = req.body;
      const facility = await this.updateFacilityService.execute({
        id,
        name,
        facility_type,
        country,
        region,
        capacity,
        status
      });
      res.status(200).json(facility);
    } catch (err) {
      next(err);
    }
  };
}
