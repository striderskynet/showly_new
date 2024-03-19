import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";
export const load = async ({ locals }) => {

    let options = {};

    if (dev) options = {
        redirectTo: 'localhost:5173'
    }
    const { data, error: err } = await locals.supabase.auth.signInWithOAuth({
        provider: 'google', options: { options }
    })

    throw redirect(303, data.url)
}