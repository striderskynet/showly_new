import { a as attr, b as attr_class, o as stringify, c as escape_html, d as derived, s as store_get, u as unsubscribe_stores } from "./index2.js";
import { c as cfg } from "./main.js";
import { s as show } from "./shows.js";
import { I as Icon } from "./Icon.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
function Default_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(relativeTime);
    let {
      data,
      delete_show,
      add_show,
      el,
      shows = true,
      defaultClass = ""
    } = $$props;
    let nextEpisode = derived(() => el.next_episode_to_air ?? null);
    let isSeasonPremiere = derived(() => nextEpisode()?.episode_number === 1);
    let followed = derived(() => store_get($$store_subs ??= {}, "$show", show).some((id) => String(id) === String(el.id)));
    let airDate = derived(() => nextEpisode()?.air_date ? dayjs(nextEpisode().air_date) : el.first_air_date ? dayjs(el.first_air_date) : null);
    let daysUntil = derived(() => airDate() ? airDate().diff(dayjs(), "days") : Infinity);
    let isUpcoming = derived(() => daysUntil() > 0);
    let isPremiereSoon = derived(() => isUpcoming() && daysUntil() <= 30);
    let address = derived(() => cfg.show_address(el));
    let imageSrc = derived(() => el.poster_path ? cfg.image_path + "500" + el.poster_path : el.backdrop_path ? cfg.image_path + "780" + el.backdrop_path : null);
    let ratingValue = derived(() => Number(el.vote_average) || 0);
    let hasRating = derived(() => ratingValue() > 0);
    let ratingText = derived(() => Number.isInteger(ratingValue()) ? ratingValue().toFixed(0) : ratingValue().toFixed(1));
    let ratingColor = derived(() => ratingValue() >= 8 ? "text-emerald-400" : ratingValue() >= 7 ? "text-sky-400" : ratingValue() >= 6 ? "text-yellow-400" : "text-amber-400");
    let dateLabel = derived(() => (() => {
      if (!airDate()) return null;
      if (Math.abs(daysUntil()) <= 90) return airDate().fromNow();
      return airDate().format("MMM D, YYYY");
    })());
    let accentRing = derived(() => isSeasonPremiere() ? "ring-amber-400/50" : followed() ? "ring-sky-500/50" : "ring-white/10");
    let bottomGradient = derived(() => isSeasonPremiere() ? "from-amber-950/95 via-black/60" : followed() ? "from-sky-950/95 via-black/60" : "from-black/95 via-black/60");
    let sizingClass = derived(() => shows ? "aspect-[2/3] min-w-[240px] sm:min-w-[280px]" : "aspect-[2/3] w-full");
    let pending = false;
    $$renderer2.push(`<a${attr("href", address())}${attr_class(`relative w-80 aspect-[1/1.7] group block overflow-hidden rounded-2xl bg-zinc-900 ring-1 ${accentRing()} cursor-pointer transition-all duration-500 hover:ring-2 hover:shadow-2xl hover:shadow-black/60 ${sizingClass()} ${stringify(defaultClass)}`)}>`);
    if (imageSrc()) {
      $$renderer2.push(`<!--[0--><img alt=""${attr("src", imageSrc())} loading="lazy" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"/>`);
    } else {
      $$renderer2.push(`<!--[-1--><div class="absolute inset-0 flex items-center justify-center bg-zinc-950">`);
      Icon($$renderer2, {
        icon: "mdi:file-image-remove",
        class: "h-20 w-20 text-zinc-700"
      });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (hasRating()) {
      $$renderer2.push(`<!--[0--><div class="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-md">`);
      Icon($$renderer2, { icon: "mdi:star", class: `h-3.5 w-3.5 ${ratingColor()}` });
      $$renderer2.push(`<!----> <span>${escape_html(ratingText())}</span></div>`);
    } else if (isPremiereSoon()) {
      $$renderer2.push(`<!--[1--><div class="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30 backdrop-blur-md">`);
      Icon($$renderer2, { icon: "mdi:fire", class: "h-3 w-3" });
      $$renderer2.push(`<!----> Soon</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="absolute right-3 top-3 z-20 flex items-center gap-1.5">`);
    if (isSeasonPremiere()) {
      $$renderer2.push(`<!--[0--><span class="rounded-full bg-amber-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30 backdrop-blur-md">Premiere</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (data.session) {
      $$renderer2.push(`<!--[0--><button type="button"${attr("aria-label", followed() ? "Unfollow show" : "Follow show")}${attr("disabled", pending, true)}${attr_class(`flex h-9 w-9 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/90 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:cursor-wait disabled:opacity-70 ${followed() ? "text-sky-400" : "text-white/80 hover:text-white"}`)}>`);
      Icon($$renderer2, {
        icon: followed() ? "mdi:bookmark" : "mdi:bookmark-outline",
        class: `h-5 w-5 ${""}`
      });
      $$renderer2.push(`<!----></button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div${attr_class(`absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end bg-gradient-to-t ${bottomGradient()} to-transparent p-4 pt-20`)}><div class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]"><div class="overflow-hidden">`);
    if (nextEpisode()) {
      $$renderer2.push(`<!--[0--><div class="mb-2 flex items-center gap-2"><span class="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 ring-1 ring-white/10">S${escape_html(nextEpisode().season_number)} · E${escape_html(nextEpisode().episode_number)}</span> <span class="text-[10px] font-medium uppercase tracking-wider text-white/50">Next</span></div> `);
      if (nextEpisode().name) {
        $$renderer2.push(`<!--[0--><p class="mb-2 line-clamp-1 text-xs text-white/70">${escape_html(nextEpisode().name)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else if (el.status) {
      $$renderer2.push(`<!--[1--><p class="mb-2 text-xs text-white/70">${escape_html(el.status)}</p>`);
    } else if (el.overview) {
      $$renderer2.push(`<!--[2--><p class="mb-2 line-clamp-2 text-xs leading-relaxed text-white/60">${escape_html(el.overview)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <h3 class="line-clamp-2 text-base font-semibold leading-tight tracking-tight text-white">${escape_html(el.name ?? el.original_name ?? "Untitled")}</h3> `);
    if (dateLabel()) {
      $$renderer2.push(`<!--[0--><p class="mt-1 text-xs font-medium text-white/60"><span class="group-hover:hidden">${escape_html(dateLabel())}</span> <span class="hidden group-hover:inline">${escape_html(airDate().format("MMM D, YYYY"))}</span></p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></a>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  Default_card as D
};
