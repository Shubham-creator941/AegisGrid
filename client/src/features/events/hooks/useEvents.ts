import { useState, useEffect } from 'react';
import type { Event, Evidence, AIAnalysis, RiskAssessment } from '../api/events.api';
import { EventsApi } from '../api/events.api';

export function useEventsList() {
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await EventsApi.getEvents();
        if (mounted) {
          setData(res.data || []);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.response?.data?.error?.code || 'EVENTS_FETCH_ERROR');
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
  }, []);

  return { data, loading, error };
}

export function useEventDetail(id: string | undefined) {
  const [data, setData] = useState<Event | null>(null);
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
        const res = await EventsApi.getEvent(id as string);
        if (mounted) {
          setData(res);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.response?.data?.error?.code || 'EVENT_NOT_FOUND');
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
  }, [id]);

  return { data, loading, error };
}

export function useEvidenceList(eventId: string | undefined) {
  const [data, setData] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setData([]);
      setError(null);
      return;
    }

    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await EventsApi.getEvidence(eventId as string);
        if (mounted) {
          setData(res.data || []);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.response?.data?.error?.code || 'EVIDENCE_FETCH_ERROR');
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
  }, [eventId]);

  return { data, loading, error };
}

export function useAIAnalysis(eventId: string | undefined) {
  const [data, setData] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setData(null);
      setError(null);
      return;
    }

    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await EventsApi.getAnalysis(eventId as string);
        if (mounted) {
          setData(res);
        }
      } catch (err: any) {
        if (mounted) {
          if (err?.response?.status === 404) {
             setData(null); // Valid empty state if not generated
          } else {
             setError(err?.response?.data?.error?.code || 'ANALYSIS_FETCH_ERROR');
          }
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
  }, [eventId]);

  return { data, loading, error };
}

export function useRiskAssessment(eventId: string | undefined) {
  const [data, setData] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setData(null);
      setError(null);
      return;
    }

    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await EventsApi.getRiskAssessment(eventId as string);
        if (mounted) {
          setData(res);
        }
      } catch (err: any) {
        if (mounted) {
          if (err?.response?.status === 404) {
             setData(null); // Valid empty state
          } else {
             setError(err?.response?.data?.error?.code || 'RISK_ASSESSMENT_FETCH_ERROR');
          }
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
  }, [eventId]);

  return { data, loading, error };
}
