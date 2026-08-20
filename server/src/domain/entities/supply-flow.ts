export interface SupplyFlow {
  id: string;
  supplier_id: string;
  origin_facility_id: string;
  destination_facility_id: string;
  corridor_id: string;
  commodity: string;
  capacity: number;
  baseline_volume: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}
