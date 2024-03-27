export const image_path = 'https://image.tmdb.org/t/p/w';
export const image_size = {
    backdrop_sizes: ['w300', 'w780', 'w1280', 'original'],
    logo_sizes: ['w45', 'w92', 'w154', 'w185', 'w300', 'w500', 'original'],
    poster_sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
    profile_sizes: ['w45', 'w185', 'h632', 'original'],
    still_sizes: ['w92', 'w185', 'w300', 'original']
};
export const api_trending_url =
    //'https://api.themoviedb.org/3/trending/tv/week?language=en-US&page=';
    'https://api.themoviedb.org/3/discover/tv?sort_by=popularity.desc&with_original_language=en&page=';
export const api_hot_url =
    'https://api.themoviedb.org/3/discover/tv?first_air_date.gte={{date}}&include_adult=false&include_null_first_air_dates=false&language=en-US&sort_by=popularity.desc&with_original_language=en&page=';
export const api_show_id = 'https://api.themoviedb.org/3/tv/';
export const api_show_search = 'https://api.themoviedb.org/3/search/tv?query=';

export const api_options = {
    headers: {
        accept: 'application/json',
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMTdiOTBhNTE4N2I2ZGQyMDYwNDA2YTk0YmUzY2Y0MSIsInN1YiI6IjY0ODdiODI1ZTI3MjYwMDBjOTMxZDQ2NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.E-YGCzw4sOaRfJM-sM40r88ZFZbrelCImRqdDsmtttU'
    }
};
export const show_address = (show) => {
    let name = show.name.replaceAll(' ', '-');
    let address = '/show/' + show.id + '/' + name;
    return address;
};

export const api_movie_nowPlaying = 'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1&region=US';
export const api_movie_popular = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&without_genres=99,10755&primary_release_date.gte={{date}}&region=US';
export const api_movie_upcoming = 'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1&region=US&sort_by=primary_release_date.asc';

export default {
    image_path,
    image_size,
    api_trending_url,
    api_hot_url,
    api_options,
    api_show_id,
    api_show_search,
    show_address,

};


