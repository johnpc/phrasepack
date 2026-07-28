import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  generateLanguage,
  regenerateLanguage,
  getGenerationRun,
  type GenerateLanguageInput,
} from './generateApi';

/** The lifecycle of a generation the UI is watching. */
export type GenPhase = 'idle' | 'starting' | 'running' | 'done' | 'failed';

type StartVars =
  { kind: 'generate'; input: GenerateLanguageInput } | { kind: 'regenerate'; languageId: string };

/** Start a generate/regenerate and poll its GenerationRun until it finishes,
 * exposing a single phase the UI can drive off. On completion it invalidates
 * the pack lists so the new/refreshed pack appears. Poll (not subscribe) keeps
 * the guest path free of an AppSync subscription. */
export function useGenerate() {
  const qc = useQueryClient();
  const [runId, setRunId] = useState<string | null>(null);
  const [phase, setPhase] = useState<GenPhase>('idle');

  const run = useQuery({
    queryKey: ['generation-run', runId],
    queryFn: () => getGenerationRun(runId as string),
    enabled: !!runId && phase === 'running',
    refetchInterval: (query) => (query.state.data?.status === 'RUNNING' ? 3000 : false),
  });

  const status = run.data?.status;
  const languageId = run.data?.languageId ?? null;
  useEffect(() => {
    if (phase !== 'running') return;
    if (status === 'DRAFT_READY') {
      setPhase('done');
      void qc.invalidateQueries({ queryKey: ['languages'] });
      void qc.invalidateQueries({ queryKey: ['language', languageId] });
      void qc.invalidateQueries({ queryKey: ['phrases', languageId] });
    } else if (status === 'FAILED') {
      setPhase('failed');
    }
  }, [phase, status, languageId, qc]);

  const start = useMutation({
    mutationFn: (v: StartVars) =>
      v.kind === 'generate' ? generateLanguage(v.input) : regenerateLanguage(v.languageId),
    onMutate: () => setPhase('starting'),
    onSuccess: (data) => {
      setRunId(data.runId);
      setPhase('running');
    },
    onError: () => setPhase('failed'),
  });

  const reset = useCallback(() => {
    setRunId(null);
    setPhase('idle');
  }, []);

  return {
    phase,
    languageId: languageId ?? start.data?.languageId ?? null,
    generate: (input: GenerateLanguageInput) => start.mutate({ kind: 'generate', input }),
    regenerate: (id: string) => start.mutate({ kind: 'regenerate', languageId: id }),
    reset,
  };
}
