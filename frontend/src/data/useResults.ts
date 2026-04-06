import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../auth/AuthContext';
import { mapResult } from './mappers';
import type { Result, ResultGroup, PlannedTest } from '../types';

export function useResults() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ResultGroup[]>([]);
  const [plannedTests, setPlannedTests] = useState<PlannedTest[]>([]);
  const [itemsCache, setItemsCache] = useState<Record<string, Result[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setPlannedTests([]);
      setItemsCache({});
      return;
    }

    setLoading(true);

    Promise.all([
      supabase.from('test_sessions').select('id, date, place, source_file, notes').order('date', { ascending: false }),
      supabase.from('results').select('*').order('created_at', { ascending: true }),
      supabase.from('planned_tests').select('*').order('planned_date', { ascending: true }),
    ]).then(([sessRes, resRes, planRes]) => {
      if (sessRes.error || resRes.error || planRes.error) {
        console.error('Supabase load error:', sessRes.error || resRes.error || planRes.error);
        setLoading(false);
        return;
      }

      const allResults = resRes.data || [];
      const resultsBySession: Record<string, Result[]> = {};
      allResults.forEach((r: Record<string, unknown>) => {
        const sid = r.session_id as string;
        if (!resultsBySession[sid]) resultsBySession[sid] = [];
        resultsBySession[sid].push(mapResult(r));
      });

      const groups: ResultGroup[] = (sessRes.data || []).map((s: Record<string, unknown>) => ({
        date: s.date as string,
        place: (s.place as string) || '',
        file: s.id as string,
        items: resultsBySession[s.id as string] || null,
        itemCount: (resultsBySession[s.id as string] || []).length,
      }));

      setSessions(groups);
      setItemsCache(resultsBySession);

      setPlannedTests((planRes.data || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        plannedDate: (p.planned_date as string) || '',
        testType: (p.test_type as string) || '',
        notes: (p.notes as string) || '',
      })));

      setLoading(false);
    });
  }, [user]);

  const loadGroupItems = useCallback(async (sessionId: string): Promise<Result[]> => {
    if (itemsCache[sessionId]) return itemsCache[sessionId];

    const { data, error } = await supabase.from('results').select('*').eq('session_id', sessionId);
    if (error || !data) return [];

    const mapped = data.map(mapResult);
    setItemsCache(prev => ({ ...prev, [sessionId]: mapped }));
    return mapped;
  }, [itemsCache]);

  return { sessions, plannedTests, loading, loadGroupItems, itemsCache };
}
