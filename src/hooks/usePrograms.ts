import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProgramMetadata {
  id: string;
  name: string;
  maxLevels: number;
  weeksPerLevel: number;
}

export function usePrograms() {
  const [programs, setPrograms] = useState<ProgramMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*');

      if (error) {
        console.error('Error fetching programs:', error);
        setLoading(false);
        return;
      }

      setPrograms(data.map(p => ({
        id: p.id,
        name: p.name,
        maxLevels: p.max_levels,
        weeksPerLevel: p.weeks_per_level
      })));
      setLoading(false);
    };

    fetchPrograms();
  }, []);

  const getProgramLimit = (programName: string): number => {
    // Exact match
    const program = programs.find(p => p.name === programName);
    if (program) return program.maxLevels;

    // Partial match (e.g. if name is "Little Creator" and DB has "Little Creator 1")
    const partialMatch = programs.find(p => programName.startsWith(p.name) || p.name.startsWith(programName));
    if (partialMatch) return partialMatch.maxLevels;

    return 6; // Default fallback
  };

  return { programs, loading, getProgramLimit };
}
