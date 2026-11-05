import { P as PUBLIC_SUPABASE_URL, a as PUBLIC_SUPABASE_ANON_KEY } from "../../chunks/public.js";
import { createBrowserClient, isBrowser, parse } from "@supabase/ssr";
import { s as show } from "../../chunks/shows.js";
const load = async ({ fetch, data, depends }) => {
  depends("supabase:auth");
  const supabase = createBrowserClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { fetch },
      cookies: {
        getAll() {
          if (!isBrowser()) {
            return data.cookies ?? [];
          }
          return Object.entries(parse(document.cookie)).map(
            ([name, value]) => ({ name, value: value ?? "" })
          );
        },
        setAll(cookiesToSet) {
          if (!isBrowser()) return;
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookie = `${name}=${value}; path=/`;
            if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
            if (options?.expires) cookie += `; expires=${options.expires.toUTCString()}`;
            if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
            if (options?.secure) cookie += `; secure`;
            document.cookie = cookie;
          });
        }
      }
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: list_of_shows } = await supabase.from("shows_following").select().eq("user_id", session.user.id).order("id", { ascending: true });
    let list = [];
    list_of_shows.forEach((e) => {
      list = [...list, e.show];
    });
    show.set(list);
  }
  return { supabase, session };
};
export {
  load
};
