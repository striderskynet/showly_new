import { c as cfg } from "../../../../../chunks/main.js";
import { error } from "@sveltejs/kit";
async function load({ fetch, params }) {
  const res = await fetch(
    `${cfg.api_show_id}${params.id}?append_to_response=credits,recommendations,videos,images,external_ids`,
    cfg.api_options
  );
  if (!res.ok) {
    throw error(res.status === 404 ? 404 : 500, "Show not found");
  }
  const show = await res.json();
  let torrents = null;
  const imdb = show.external_ids?.imdb_id;
  if (imdb) {
    try {
      const t = await fetch(
        `https://eztvx.to/api/get-torrents?imdb_id=${imdb.replace(/^tt/, "")}&limit=100`
      );
      if (t.ok) {
        const json = await t.json();
        torrents = json.torrents ?? null;
      }
    } catch {
    }
  }
  return { show, torrents };
}
export {
  load
};
