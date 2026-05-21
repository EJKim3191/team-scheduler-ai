import { createClient } from "@supabase/supabase-js";

// ⚠️ 주의: service_role 키는 절대 클라이언트 컴포넌트나 브라우저에 노출되면 안 됩니다.
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
};
