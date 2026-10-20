-- Fix: creating a round with RETURNING (PostgREST `return=representation`,
-- supabase-js `.insert().select()`) failed RLS with 403.
--
-- Cause: rounds_select used only can_view_round(id), a STABLE SECURITY DEFINER
-- function. It runs with the statement's snapshot, so it can't see the row the
-- same INSERT just created — the creator was denied their own new round.
--
-- Fix: check the owner columns directly on the row first; fall back to the
-- function for members, public and friends visibility.

drop policy if exists rounds_select on public.rounds;
create policy rounds_select on public.rounds for select to authenticated
  using (created_by = auth.uid() or scorekeeper_id = auth.uid() or public.can_view_round(id));
