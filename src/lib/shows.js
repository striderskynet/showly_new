import { get, writable } from "svelte/store";

export const show = writable([]);

/** Añade una serie: update optimista + rollback si la BD falla. */
export async function show_add(db, user_id, show_id, favourite = false) {
    const previous = get(show);
    if (previous.includes(show_id)) return; // dedupe

    show.set([show_id, ...previous]);

    const { error } = await db
        .from("shows_following")
        .insert({ user_id, show: show_id, favorite: favourite });

    if (error) {
        show.set(previous); // rollback
        throw error;
    }
}

/** Quita una serie: update optimista + rollback si la BD falla. */
export async function show_del(db, user_id, show_id) {
    const previous = get(show);

    show.set(previous.filter((id) => id !== show_id));

    const { error } = await db
        .from("shows_following")
        .delete()
        .eq("user_id", user_id)
        .eq("show", show_id);

    if (error) {
        show.set(previous); // rollback
        throw error;
    }
}

/** Alterna el estado de seguimiento. */
export async function show_toggle(db, user_id, show_id, favourite = false) {
    const { count, error } = await db
        .from("shows_following")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user_id)
        .eq("show", show_id);

    if (error) throw error;

    if (count > 0) {
        await show_del(db, user_id, show_id);
    } else {
        await show_add(db, user_id, show_id, favourite);
    }
}