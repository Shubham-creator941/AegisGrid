import { useState, useEffect } from 'react';
import type { Supplier, Facility, Corridor, SupplyFlow } from '../api/network.api';
import { NetworkApi } from '../api/network.api';

export function useNetworkOverview() {
  const [data, setData] = useState<{
    suppliers: Supplier[];
    facilities: Facility[];
    corridors: Corridor[];
    supplyFlows: SupplyFlow[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      try {
        setLoading(true);
        setError(null);
        const [
          suppliersRes,
          facilitiesRes,
          corridorsRes,
          supplyFlowsRes
        ] = await Promise.all([
          NetworkApi.getSuppliers(),
          NetworkApi.getFacilities(),
          NetworkApi.getCorridors(),
          NetworkApi.getSupplyFlows()
        ]);

        if (mounted) {
          setData({
            suppliers: suppliersRes.data || [],
            facilities: facilitiesRes.data || [],
            corridors: corridorsRes.data || [],
            supplyFlows: supplyFlowsRes.data || [],
          });
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.response?.data?.error?.code || 'NETWORK_FETCH_ERROR');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchAll();
    
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

export function useNetworkEntities<T>(
  fetcher: () => Promise<{ data: T[]; meta: any }>
) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetcher();
        if (mounted) {
          setData(res.data || []);
          setMeta(res.meta || null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.response?.data?.error?.code || 'ENTITY_FETCH_ERROR');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [fetcher]);

  return { data, meta, loading, error };
}

export function useEntityDetail<T>(
  id: string | undefined,
  fetcher: (id: string) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setError(null);
      return;
    }

    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetcher(id as string);
        if (mounted) {
          setData(res);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.response?.data?.error?.code || 'ENTITY_NOT_FOUND');
          setData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [id, fetcher]);

  return { data, loading, error };
}
