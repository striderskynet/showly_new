import { redirect } from "@sveltejs/kit";
const load = async ({ locals }) => {
  let options = {};
  const { data, error: err } = await locals.supabase.auth.signInWithOAuth({
    provider: "google",
    options: { options }
  });
  throw redirect(303, data.url);
};
export {
  load
};
