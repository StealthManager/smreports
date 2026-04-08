ALTER TABLE public.closers ADD COLUMN ghl_user_id text;
CREATE UNIQUE INDEX idx_closers_ghl_user_id ON public.closers (ghl_user_id) WHERE ghl_user_id IS NOT NULL;