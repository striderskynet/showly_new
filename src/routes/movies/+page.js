
import { api_movie_nowPlaying, api_movie_popular, api_movie_upcoming, api_options } from '$config/main';
import dayjs from 'dayjs';

export async function load({ fetch }) {

    let movies_nowPlaying_promise = fetch(api_movie_nowPlaying, api_options
    ).then((x) => x.json());

    let movies_popular = fetch(api_movie_popular.replaceAll(
        '{{date}}',
        dayjs().format('YYYY-MM-DD')), api_options
    ).then((x) => x.json());

    let movies_upcoming = fetch(api_movie_upcoming.replaceAll(
        '{{date}}',
        dayjs().format('YYYY-MM-DD')
    ), api_options
    ).then((x) => x.json());

    console.log(api_movie_popular.replaceAll(
        '{{date}}',
        dayjs().subtract(1, 'year').format('YYYY')));
    // console.log(api_movie_upcoming.replaceAll(
    //     '{{date}}',
    //     dayjs().format('YYYY-MM-DD')
    // ))
    return {
        nowPlaying_list: movies_nowPlaying_promise,
        popular_list: movies_popular,
        upcoming_list: movies_upcoming,
    };
}
