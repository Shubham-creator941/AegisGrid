import { useState, useCallback } from 'react';
import type { Scenario } from '../api/scenarios.api';
import { ScenariosApi } from '../api/scenarios.api';

export function useScenarios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const fetchScenarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ScenariosApi.getScenarios();
      setScenarios(data.data); // data contains { data: Scenario[], meta: any }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to fetch scenarios'));
    } finally {
      setLoading(false);
    }
  }, []);

  return { scenarios, loading, error, fetchScenarios };
}

export function useScenario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  const fetchScenario = useCallback(async (scenarioId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    try {
      setLoading(true);
      setError(null);
      const data = await ScenariosApi.getScenario(scenarioId);
      setScenario(data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to fetch scenario'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createScenario = useCallback(async (data: { name: string, description: string, event_id: string, created_by: string }) => {
    try {
      setLoading(true);
      setError(null);
      const created = await ScenariosApi.createScenario(data);
      setScenario(created);
      return created;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to create scenario'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const evaluateScenario = useCallback(async (scenarioId: string, idempotencyKey?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ScenariosApi.evaluateScenario(scenarioId, idempotencyKey);
      return response.data;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to evaluate scenario'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { scenario, loading, error, fetchScenario, createScenario, evaluateScenario };
}
