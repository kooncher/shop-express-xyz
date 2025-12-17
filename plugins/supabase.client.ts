import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      auth: {
        persistSession: true,  // เพิ่มบรรทัดนี้
        autoRefreshToken: true,  // เพิ่มบรรทัดนี้
        detectSessionInUrl: true,  // เพิ่มบรรทัดนี้
        storage: window.localStorage  // เพิ่มบรรทัดนี้
      }
    }
  )

  return {
    provide: {
      supabase
    }
  }
})