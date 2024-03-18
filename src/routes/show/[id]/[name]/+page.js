import cfg from '$config/main';
export async function load({ fetch, params }) {
    const show_fetcher = await fetch(cfg.api_show_id + params.id + "?append_to_response=credits,recommendations,videos,images", cfg.api_options);
    const show = await show_fetcher.json();


    return {

        show: show,
    };
}
