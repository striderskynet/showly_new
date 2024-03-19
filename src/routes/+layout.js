// src/routes/+layout.js
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import { show } from '../lib/shows';

export const load = async ({ fetch, data, depends }) => {
    depends('supabase:auth')


    const supabase = createSupabaseLoadClient({
        supabaseUrl: PUBLIC_SUPABASE_URL,
        supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
        event: { fetch },
        serverSession: data.session,
    })


    const { data: { session } } = await supabase.auth.getSession()

    if (data.session) {
        const { data: list_of_shows } = await supabase.from('shows_following').select().eq('user_id', session.user.id).order('id', { ascending: true });

        let list = [];
        list_of_shows.forEach((e) => {
            list = [...list, e.show]
        })
        show.set(list)
        //  console.log(list);
    }

    return { supabase, session }
}