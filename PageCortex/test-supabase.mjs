import { createServerClient } from '@supabase/ssr';

try {
  const supabase = createServerClient(
    'https://example.supabase.co',
    'public-anon-key',
    {
      cookies: {
        getAll: () => []
      }
    }
  );
  console.log("Success");
} catch (err) {
  console.error("Error:", err.message);
}
