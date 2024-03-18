import { show_toggle } from "$lib/shows";
import { fail } from "@sveltejs/kit";

export const load = async (locals) => {
    const data = await locals.parent();

    if (!data.session) return fail(400, { message: "You must log in first" })

    show_toggle(data.supabase, data.session.user.id, locals.params.id);

}
