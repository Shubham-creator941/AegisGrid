import { useState, useCallback } from 'react';
import type { Evaluation, EvaluationResult } from '../api/evaluations.api';
import { EvaluationsApi } from '../api/evaluations.api';

export function useEvaluation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  const fetchEvaluationStatus = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await EvaluationsApi.getEvaluationStatus(id);
      setEvaluation(data);
      return data;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to fetch evaluation status'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvaluationResult = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await EvaluationsApi.getEvaluationResult(id);
      setEvaluationResult(data);
      setEvaluation(data.evaluation);
      return data;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to fetch evaluation result'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { evaluation, evaluationResult, loading, error, fetchEvaluationStatus, fetchEvaluationResult };
}
