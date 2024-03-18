import { redirect } from "@sveltejs/kit"
export const load = async ({ locals }) => {

    const { data, error: err } = await locals.supabase.auth.signInWithOAuth({
        provider: 'google',
    })

    throw redirect(303, data.url)
}