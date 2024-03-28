import cfg from '$config/main';
export async function load({ fetch, params }) {
    const show_fetcher = await fetch(cfg.api_show_id + params.id + "?append_to_response=credits,recommendations,videos,images,external_ids", cfg.api_options);
    let show = await show_fetcher.json();

    let torrent_fetcher = await fetch('https://eztvx.to/api/get-torrents?imdb_id=' + show.external_ids.imdb_id.replaceAll('tt', '') + '&limit=100')
    show.torrent_list = await torrent_fetcher.json();

    return {
        show: show,
    };
}
