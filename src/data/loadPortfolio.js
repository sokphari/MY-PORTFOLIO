import { portfolio } from './portfolio';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export async function loadPortfolio() {
  if (!isSupabaseConfigured) return portfolio;

  const { data, error } = await supabase
    .from('portfolio_content')
    .select('content')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.content || typeof data.content !== 'object') return portfolio;

  return { ...portfolio, ...data.content };
}
