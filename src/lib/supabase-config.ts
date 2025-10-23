// Configuración temporal de Supabase
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here'
};

// Función temporal para verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  return supabaseConfig.url !== 'https://your-project.supabase.co' && 
         supabaseConfig.anonKey !== 'your-anon-key-here';
};
