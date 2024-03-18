
export const load = async ({ locals }) => {
    //console.log(locals)
    const { error: err } = await locals.supabase.auth.signOut()

}