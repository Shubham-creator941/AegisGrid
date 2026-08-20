import { FacilityType } from '../enums/index.js';

export interface Facility {
  id: string;
  name: string;
  facility_type: FacilityType;
  country: string;
  region: string;
  capacity: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}
