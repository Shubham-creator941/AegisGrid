export interface NetworkSnapshot {
  id: string;
  snapshot_version: number;
  created_at: Date;
  created_by: string;
  description: string;
  snapshot_data: unknown;
}
