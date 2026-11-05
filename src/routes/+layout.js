import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';
import { show } from '../lib/shows';

export const load = async ({ fetch, data, depends }) => {
    depends('supabase:auth');

    const supabase = createBrowserClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY,
        {
            global: { fetch },
            cookies: {
                getAll() {
                    if (!isBrowser()) {
                        return data.cookies ?? []; // ← array from +layout.server.js
                    }
                    // parse() returns an object; map it to an array
                    return Object.entries(parse(document.cookie)).map(
                        ([name, value]) => ({ name, value: value ?? '' })
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
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        const { data: list_of_shows } = await supabase
            .from('shows_following')
            .select()
            .eq('user_id', session.user.id)
            .order('id', { ascending: true });

        let list = [];
        list_of_shows.forEach((e) => {
            list = [...list, e.show];
        });
        show.set(list);
    }

    return { supabase, session };
};