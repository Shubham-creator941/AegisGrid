export interface SimulationResult {
  id: string;
  evaluation_id: string;
  available_supply: number;
  affected_capacity: number;
  shortfall: number;
  reserve_level: number;
  network_state: unknown;
  affected_flow_ids: string[];
  calculation_version: string;
  created_at: Date;
}
