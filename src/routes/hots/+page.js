
import $cfg from '$config/main';

import dayjs from 'dayjs';
export async function load({ fetch }) {


    let upcoming_promise = fetch($cfg.api_hot_url.replaceAll(
        '{{date}}',
        dayjs().format('YYYY-MM-DD')
    ), $cfg.api_options
    ).then((x) => x.json());

    let trending_promise = fetch($cfg.api_trending_url, $cfg.api_options
    ).then((x) => x.json());


    return {
        upcoming_list: upcoming_promise,
        trending_list: trending_promise
    };
}
