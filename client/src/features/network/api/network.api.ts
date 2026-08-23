import { apiClient } from '../../../api/client';

export interface Supplier {
  id: string;
  name: string;
  country: string;
  supplier_type: string;
  status: string;
  
  // Extended UI fields
  current_supply?: string;
  supply_share?: string;
  active_routes?: number;
  risk_score?: number;
  risk_trend?: number;
  primary_terminal?: string;
  supply_reliability?: string;
  primary_corridor?: string;
  supply_trend?: number[];
  
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  name: string;
  facility_type: string;
  country: string;
  region: string;
  capacity: number;
  status: string;

  // Extended UI fields
  current_throughput?: string;
  risk_level?: string;
  risk_score?: number;

  created_at: string;
  updated_at: string;
}

export interface Corridor {
  id: string;
  name: string;
  corridor_type: string;
  origin: string;
  destination: string;
  capacity: number;
  status: string;

  // Extended UI fields
  current_throughput?: string;
  risk_score?: number;
  direction?: string;
  affected_regions?: string[];

  created_at: string;
  updated_at: string;
}

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
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export const NetworkApi = {
  getSuppliers: async (page = 1, limit = 100) => {
    const res = await apiClient.get<{ success: boolean; data: Supplier[]; meta: any }>(`/api/v1/suppliers?page=${page}&limit=${limit}`);
    return res.data;
  },
  getSupplier: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Supplier }>(`/api/v1/suppliers/${id}`);
    return res.data.data;
  },
  getFacilities: async (page = 1, limit = 100) => {
    const res = await apiClient.get<{ success: boolean; data: Facility[]; meta: any }>(`/api/v1/facilities?page=${page}&limit=${limit}`);
    return res.data;
  },
  getFacility: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Facility }>(`/api/v1/facilities/${id}`);
    return res.data.data;
  },
  getCorridors: async (page = 1, limit = 100) => {
    const res = await apiClient.get<{ success: boolean; data: Corridor[]; meta: any }>(`/api/v1/corridors?page=${page}&limit=${limit}`);
    return res.data;
  },
  getCorridor: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Corridor }>(`/api/v1/corridors/${id}`);
    return res.data.data;
  },
  getSupplyFlows: async (page = 1, limit = 100) => {
    const res = await apiClient.get<{ success: boolean; data: SupplyFlow[]; meta: any }>(`/api/v1/supply-flows?page=${page}&limit=${limit}`);
    return res.data;
  },
  getSupplyFlow: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: SupplyFlow }>(`/api/v1/supply-flows/${id}`);
    return res.data.data;
  },
};
