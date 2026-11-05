import { c as show_toggle } from "../../../../../chunks/shows.js";
import { fail } from "@sveltejs/kit";
const load = async (locals) => {
  const data = await locals.parent();
  if (!data.session) return fail(400, { message: "You must log in first" });
  show_toggle(data.supabase, data.session.user.id, locals.params.id);
};
export {
  load
};
