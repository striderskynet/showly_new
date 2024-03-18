import { get, writable } from "svelte/store";
export const show = writable([]);

export const show_toggle = async (db, user_id, show_id, favourite = false) => {

    const { count, error_list } = await db.from('shows_following').select('*', { count: 'exact', head: true }).eq('user_id', user_id).eq('show', show_id)

    if (count > 0) {  // Remove show

        console.log("Removing show from database", show_id)

        const { error } = await db
            .from('shows_following')
            .delete()
            .eq('user_id', user_id).eq('show', show_id)

        if (error) console.log(error)

        console.log("this", last_show, show)
        //delete show[show_id]
    } else { // Add Show

        let new_show = {
            user_id: user_id, show: show_id, favorite: favourite
        }
        console.log("Adding show to database", new_show)

        let last_show;
        show.subscribe((val) => { last_show = val })
        last_show = [show_id, ...last_show];
        show.set(last_show);

        const { error } = await db.from('shows_following').insert(new_show);

        if (error) console.log(error)

    }

    console.log(show)
}

export const show_del = async (db, user_id, show_id, favourite = false) => {

    let last_show = get(show);
    last_show = last_show.filter(o => o !== show_id);
    show.set(last_show);

    console.log("Removing show from database", show_id)

    const { error } = await db
        .from('shows_following')
        .delete()
        .eq('user_id', user_id).eq('show', show_id)

    if (error) console.log(error)

    // let new_show = {
    //     user_id: user_id, show: show_id, favorite: favourite
    // }
    // console.log("Adding show to database", new_show)

    // const { error } = await db.from('shows_following').insert(new_show);

    if (error) console.log(error)
}


export const show_add = async (db, user_id, show_id, favourite = false) => {
    let new_show = {
        user_id: user_id, show: show_id, favorite: favourite
    }
    console.log("Adding show to database", new_show)

    let last_show = get(show);
    last_show = [...last_show, show_id]
    show.set(last_show);

    const { error } = await db.from('shows_following').insert(new_show);

    if (error) console.log(error)

}