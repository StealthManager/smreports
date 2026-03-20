
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'closer', 'media_buyer', 'viewer');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Team members / closers
CREATE TABLE public.closers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.closers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Closers viewable by authenticated" ON public.closers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage closers" ON public.closers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Ad spend tracking
CREATE TABLE public.ad_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,
  channel TEXT NOT NULL,
  product TEXT,
  closer_id UUID REFERENCES public.closers(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_spend ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ad spend viewable by authenticated" ON public.ad_spend FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and media buyers can manage spend" ON public.ad_spend FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'media_buyer')
);

-- Leads
CREATE TYPE public.lead_stage AS ENUM ('cold_lead', 'general_lead', 'hot_lead', 'unpaid_invoice', 'opportunity_won', 'not_a_good_fit', 'no_show');
CREATE TYPE public.lead_qualification AS ENUM ('sql_qualified', 'mql', 'not_a_good_fit', 'na');

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closer_id UUID REFERENCES public.closers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT,
  first_call_date DATE,
  show_up BOOLEAN DEFAULT false,
  pipeline_stage lead_stage NOT NULL DEFAULT 'cold_lead',
  service TEXT,
  source TEXT,
  deal_size NUMERIC(12,2) DEFAULT 0,
  qualification lead_qualification DEFAULT 'mql',
  utm TEXT,
  reason TEXT,
  next_steps TEXT,
  last_followup DATE,
  closed_on DATE,
  sales_cycle_days INTEGER,
  revenue NUMERIC(12,2) DEFAULT 0,
  ghl_contact_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leads viewable by authenticated" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Closers and admins can update leads" ON public.leads FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR
  closer_id IN (SELECT id FROM public.closers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- UTM Performance tracking
CREATE TABLE public.utm_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,
  utm TEXT NOT NULL,
  total_leads INTEGER DEFAULT 0,
  hot_rate NUMERIC(5,2) DEFAULT 0,
  won_rate NUMERIC(5,2) DEFAULT 0,
  spend NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.utm_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "UTM perf viewable by authenticated" ON public.utm_performance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and media buyers can manage UTM" ON public.utm_performance FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'media_buyer')
);

-- Material approvals
CREATE TYPE public.material_type AS ENUM ('image', 'text', 'video');
CREATE TYPE public.material_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type material_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  channel TEXT,
  status material_status NOT NULL DEFAULT 'pending',
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Materials viewable by authenticated" ON public.materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can submit materials" ON public.materials FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Reviewers can update materials" ON public.materials FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'media_buyer') OR submitted_by = auth.uid()
);
CREATE POLICY "Admins can delete materials" ON public.materials FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Integration connections
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'disconnected',
  api_key_ref TEXT,
  last_sync_at TIMESTAMPTZ,
  leads_imported INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Integrations viewable by authenticated" ON public.integrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage integrations" ON public.integrations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for material files
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true);
CREATE POLICY "Materials files publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
CREATE POLICY "Authenticated can upload materials" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'materials');
CREATE POLICY "Admins can delete material files" ON storage.objects FOR DELETE USING (bucket_id = 'materials' AND public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ad_spend_updated_at BEFORE UPDATE ON public.ad_spend FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_leads_closer ON public.leads(closer_id);
CREATE INDEX idx_leads_stage ON public.leads(pipeline_stage);
CREATE INDEX idx_leads_qualification ON public.leads(qualification);
CREATE INDEX idx_ad_spend_month ON public.ad_spend(month);
CREATE INDEX idx_utm_perf_month ON public.utm_performance(month);
CREATE INDEX idx_materials_status ON public.materials(status);
