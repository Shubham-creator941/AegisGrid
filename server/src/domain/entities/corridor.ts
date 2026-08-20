export interface Corridor {
  id: string;
  name: string;
  corridor_type: string;
  origin: string;
  destination: string;
  capacity: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}
