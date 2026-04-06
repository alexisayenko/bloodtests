import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../auth/AuthContext';
import type { TestingScheduleEntry } from '../types';

export function useTestingSchedule() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TestingScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setEntries([]); return; }

    setLoading(true);
    supabase
      .from('testing_schedule')
      .select('id, panel_id, loinc, frequency_months')
      .then(({ data, error }) => {
        if (error) { console.error('Schedule load error:', error); setLoading(false); return; }
        setEntries((data || []).map((r: Record<string, unknown>) => ({
          id: r.id as string,
          panelId: (r.panel_id as string) || null,
          loinc: (r.loinc as string) || null,
          frequencyMonths: r.frequency_months as number,
        })));
        setLoading(false);
      });
  }, [user]);

  const setSchedule = useCallback(async (
    panelId: string,
    loinc: string | null,
    frequencyMonths: number | null,
  ) => {
    if (!user) return;

    if (frequencyMonths === null) {
      const query = loinc !== null
        ? supabase.from('testing_schedule').delete().eq('user_id', user.id).eq('panel_id', panelId).eq('loinc', loinc)
        : supabase.from('testing_schedule').delete().eq('user_id', user.id).eq('panel_id', panelId).is('loinc', null);

      const { error } = await query;
      if (error) { console.error('Schedule delete error:', error); return; }

      setEntries(prev => prev.filter(e =>
        !(e.panelId === panelId && e.loinc === loinc)
      ));
      return;
    }

    // Upsert
    const row = {
      user_id: user.id,
      panel_id: panelId,
      loinc: loinc,
      frequency_months: frequencyMonths,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('testing_schedule')
      .upsert(row, { onConflict: 'user_id,panel_id,loinc' })
      .select('id, panel_id, loinc, frequency_months')
      .single();

    if (error) { console.error('Schedule upsert error:', error); return; }

    const entry: TestingScheduleEntry = {
      id: data.id,
      panelId: data.panel_id || null,
      loinc: data.loinc || null,
      frequencyMonths: data.frequency_months,
    };

    setEntries(prev => {
      const idx = prev.findIndex(e => e.panelId === panelId && e.loinc === loinc);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
  }, [user]);

  const getPanelFrequency = useCallback((panelId: string): number | null => {
    const entry = entries.find(e => e.panelId === panelId && e.loinc === null);
    return entry ? entry.frequencyMonths : null;
  }, [entries]);

  const getBiomarkerFrequency = useCallback((panelId: string, loinc: string): number | null => {
    const override = entries.find(e => e.panelId === panelId && e.loinc === loinc);
    return override ? override.frequencyMonths : null;
  }, [entries]);

  const getEffectiveFrequency = useCallback((panelId: string, loinc: string): number | null => {
    return getBiomarkerFrequency(panelId, loinc) ?? getPanelFrequency(panelId);
  }, [getBiomarkerFrequency, getPanelFrequency]);

  return {
    entries, loading,
    setSchedule,
    getPanelFrequency,
    getBiomarkerFrequency,
    getEffectiveFrequency,
  };
}
