const load = async ({ locals }) => {
  const { error: err } = await locals.supabase.auth.signOut();
};
export {
  load
};
