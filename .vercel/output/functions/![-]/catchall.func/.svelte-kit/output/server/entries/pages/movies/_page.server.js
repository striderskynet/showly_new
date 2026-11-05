import { a as api_movie_nowPlaying, b as api_options, d as api_movie_popular, e as api_movie_upcoming } from "../../../chunks/main.js";
import dayjs from "dayjs";
async function load({ fetch }) {
  let streaming_url = `https://www.whentostream.com/${dayjs().format("MMMM-YYYY").toLowerCase()}-streaming`;
  let movies_nowPlaying_promise = fetch(
    api_movie_nowPlaying,
    api_options
  ).then((x) => x.json());
  let movies_popular = fetch(
    api_movie_popular.replaceAll(
      "{{date}}",
      dayjs().format("YYYY-MM-DD")
    ),
    api_options
  ).then((x) => x.json());
  let movies_upcoming = fetch(
    api_movie_upcoming.replaceAll(
      "{{date}}",
      dayjs().format("YYYY-MM-DD")
    ),
    api_options
  ).then((x) => x.json());
  let movies_streaming = fetch(streaming_url).then((x) => x.text());
  return {
    nowPlaying_list: movies_nowPlaying_promise,
    popular_list: movies_popular,
    upcoming_list: movies_upcoming,
    streaming: movies_streaming
  };
}
export {
  load
};
