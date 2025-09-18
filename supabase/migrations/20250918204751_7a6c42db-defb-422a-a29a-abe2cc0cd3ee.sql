-- Create table for caching MercadoLibre search results
CREATE TABLE public.comparables_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text UNIQUE NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Enable RLS
ALTER TABLE public.comparables_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for comparables_cache
CREATE POLICY "Anyone can read non-expired cache entries" 
ON public.comparables_cache 
FOR SELECT 
USING (expires_at > now());

CREATE POLICY "System can manage cache entries" 
ON public.comparables_cache 
FOR ALL 
USING (true);