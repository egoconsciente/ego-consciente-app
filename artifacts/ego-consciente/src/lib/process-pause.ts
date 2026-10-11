import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

// Only paused_at changes: stages, PEA, portal and process start remain intact.
export function useProcessPause(userId?: string) {
  const [state, setState] = useState<{
    owner?: string;
    paused: boolean;
    loading: boolean;
    error: string | null;
  }>({ paused: false, loading: true, error: null });
  const [busy, setBusy] = useState(false);
  const owner = useRef(userId);
  owner.current = userId;
  const pending = useRef(false);
  const revision = useRef(0);
  const reload = useCallback(async () => {
    if (!userId || pending.current) return;
    const request = ++revision.current;
    try {
      const { data, error } = await supabase
        .from("journey_state")
        .select("paused_at")
        .eq("user_id", userId)
        .single();
      if (error || !data) throw error;
      if (owner.current === userId && request === revision.current)
        setState({
          owner: userId,
          paused: !!data.paused_at,
          loading: false,
          error: null,
        });
    } catch {
      if (owner.current === userId && request === revision.current)
        setState((s) => ({
          ...s,
          owner: userId,
          loading: false,
          error: "No pudimos consultar la pausa. Vuelve a intentarlo.",
        }));
    }
  }, [userId]);
  useEffect(() => {
    setState({ owner: userId, paused: false, loading: true, error: null });
    void reload();
    const refresh = () => {
      void reload();
    };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [userId, reload]);
  const setPaused = async (paused: boolean): Promise<boolean> => {
    if (
      !userId ||
      pending.current ||
      state.owner !== userId ||
      state.loading ||
      state.error
    )
      return false;
    ++revision.current; // Discard reads started before this write.
    pending.current = true;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("journey_state")
        .update({ paused_at: paused ? new Date().toISOString() : null })
        .eq("user_id", userId)
        .select("paused_at")
        .single();
      if (error || !data || !!data.paused_at !== paused) throw error;
      if (owner.current !== userId) return false;
      setState({ owner: userId, paused, loading: false, error: null });
      return true;
    } catch {
      // Keep the last confirmed state. A failed write is never a confirmation.
      if (owner.current === userId)
        setState((s) => ({
          ...s,
          error:
            "No pudimos guardar el cambio. Consulta el estado y vuelve a intentarlo.",
        }));
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return {
    ...state,
    loading: state.loading || state.owner !== userId,
    busy,
    setPaused,
    reload,
  };
}
