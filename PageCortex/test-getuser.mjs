import { createServerClient } from '@supabase/ssr';

try {
  const supabase = createServerClient(
    'https://tqbcaynfcqyfrjudscqt.supabase.co',
    'sb_publishable_Er29OiKxu47KQZMCpjgN-w_424IN5Ut', // fake or real from env
    {
      cookies: {
        getAll: () => [{ name: 'sb-tqbcaynfcqyfrjudscqt-auth-token', value: 'fake-token' }]
      }
    }
  );
  
  // Call getUser to see if it throws when missing setAll
  await supabase.auth.getUser();
  console.log("getUser success");
} catch (err) {
  console.error("getUser Error:", err.message);
}
