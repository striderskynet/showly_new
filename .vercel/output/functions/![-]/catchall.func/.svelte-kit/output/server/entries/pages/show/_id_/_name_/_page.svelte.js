import { m as head, a as attr, c as escape_html, o as stringify, b as attr_class, e as ensure_array_like, d as derived, s as store_get, u as unsubscribe_stores } from "../../../../../chunks/index2.js";
import { c as cfg } from "../../../../../chunks/main.js";
import { s as show } from "../../../../../chunks/shows.js";
import { I as Icon } from "../../../../../chunks/Icon.js";
import { S as Splide_1, a as SplideSlide } from "../../../../../chunks/SplideSlide.js";
/* empty css                               */
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(relativeTime);
    let { data } = $$props;
    const splideOptions = {
      arrows: true,
      perPage: "auto",
      focus: "left",
      snap: true,
      pagination: false,
      gap: "12px"
    };
    function getRatingStyle(r) {
      if (!r) return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
      if (r >= 8) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      if (r >= 7) return "text-sky-400 bg-sky-500/10 border-sky-500/20";
      if (r >= 6) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      if (r >= 5) return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
    function getStatusStyle(status) {
      switch (status) {
        case "Returning Series":
          return "bg-sky-500/10 text-sky-400 border-sky-500/20";
        case "In Production":
          return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "Ended":
        case "Canceled":
          return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        default:
          return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      }
    }
    function buildKeyCrew(creators2, crew2) {
      const sections = [];
      if (creators2.length) sections.push({ label: "Created by", people: creators2 });
      const groups = [
        { label: "Executive Producers", jobs: ["Executive Producer"] },
        {
          label: "Producers",
          jobs: ["Producer", "Co-Producer", "Co-Executive Producer"]
        },
        {
          label: "Writers",
          jobs: [
            "Writer",
            "Screenplay",
            "Story",
            "Story Editor",
            "Staff Writer"
          ]
        },
        { label: "Music", jobs: ["Original Music Composer"] },
        { label: "Cinematography", jobs: ["Director of Photography"] },
        { label: "Editing", jobs: ["Editor"] },
        { label: "Casting", jobs: ["Casting"] },
        { label: "Art Direction", jobs: ["Art Direction"] },
        { label: "Costume Design", jobs: ["Costume Design"] }
      ];
      for (const g of groups) {
        const people = crew2.filter((c) => g.jobs.includes(c.job));
        const unique = [...new Map(people.map((p) => [p.id, p])).values()];
        if (unique.length) sections.push({ label: g.label, people: unique });
      }
      return sections;
    }
    let showData = derived(() => data.show);
    let torrents = derived(() => data.torrents ?? []);
    let mainPoster = derived(() => showData()?.images?.posters?.find((p) => p.iso_639_1 === "en" && p.iso_3166_1 === "US") ?? showData()?.images?.posters?.find((p) => p.iso_639_1 === "en") ?? showData()?.images?.posters?.[0]);
    let posterUrl = derived(() => mainPoster()?.file_path ? `${cfg.image_path}500${mainPoster().file_path}` : showData()?.poster_path ? `${cfg.image_path}500${showData().poster_path}` : null);
    let backdropUrl = derived(() => showData()?.backdrop_path ? `${cfg.image_path}1280${showData().backdrop_path}` : null);
    let network = derived(() => showData()?.networks?.[0]);
    let isFollowed = derived(() => store_get($$store_subs ??= {}, "$show", show).includes(showData()?.id));
    let year = derived(() => showData()?.first_air_date ? dayjs(showData().first_air_date).format("YYYY") : null);
    let runtime = derived(() => showData()?.episode_run_time?.[0] ?? null);
    let rating = derived(() => showData()?.vote_average);
    let ratingStyle = derived(() => getRatingStyle(rating()));
    let statusStyle = derived(() => getStatusStyle(showData()?.status));
    let creators = derived(() => showData()?.created_by ?? []);
    let cast = derived(() => showData()?.credits?.cast ?? []);
    let crew = derived(() => showData()?.credits?.crew ?? []);
    let companies = derived(() => showData()?.production_companies ?? []);
    let countries = derived(() => showData()?.production_countries ?? []);
    let languages = derived(() => showData()?.spoken_languages ?? []);
    let seasons = derived(() => showData()?.seasons ?? []);
    let recommendations = derived(() => showData()?.recommendations?.results ?? []);
    let videos = derived(() => (showData()?.videos?.results ?? []).filter((v) => v.site === "YouTube"));
    let trailer = derived(() => videos().filter((v) => v.type === "Trailer").at(-1) ?? videos().at(-1));
    let keyCrew = derived(() => buildKeyCrew(creators(), crew()));
    let externalLinks = derived(() => [
      showData()?.external_ids?.imdb_id && {
        label: "IMDb",
        url: `https://www.imdb.com/title/${showData().external_ids.imdb_id}`,
        icon: "simple-icons:imdb"
      },
      showData()?.external_ids?.tvdb_id && {
        label: "TheTVDB",
        url: `https://thetvdb.com/series/${showData().external_ids.tvdb_id}`,
        icon: "simple-icons:thetvdb"
      },
      showData()?.external_ids?.wikidata_id && {
        label: "Wikidata",
        url: `https://www.wikidata.org/wiki/${showData().external_ids.wikidata_id}`,
        icon: "simple-icons:wikidata"
      },
      showData()?.homepage && {
        label: "Official site",
        url: showData().homepage,
        icon: "mdi:web"
      }
    ].filter(Boolean));
    let stats = derived(() => [
      {
        label: "Rating",
        value: rating() ? rating().toFixed(1) : "—",
        sub: showData()?.vote_count ? `${showData().vote_count.toLocaleString()} votes` : null
      },
      {
        label: "Seasons",
        value: showData()?.number_of_seasons ?? "—"
      },
      {
        label: "Episodes",
        value: showData()?.number_of_episodes ?? "—"
      },
      {
        label: "Runtime",
        value: runtime() ? `${runtime()}m` : "—",
        sub: "per episode"
      },
      {
        label: "Popularity",
        value: showData()?.popularity ? showData().popularity.toFixed(1) : "—"
      }
    ]);
    head("19pvc2s", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(showData()?.name ?? "Show")} · Showly</title>`);
      });
      $$renderer3.push(`<meta property="og:title"${attr("content", `${stringify(showData()?.name)} · Showly`)}/> <meta property="og:description"${attr("content", showData()?.overview)}/> `);
      if (showData()?.poster_path) {
        $$renderer3.push(`<!--[0--><meta property="og:image"${attr("content", `${stringify(cfg.image_path)}300${stringify(showData().poster_path)}`)}/>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`<div class="min-h-screen bg-zinc-950 text-zinc-100"><section class="relative">`);
    if (backdropUrl()) {
      $$renderer2.push(`<!--[0--><div class="absolute inset-0 overflow-hidden"><img${attr("src", backdropUrl())} alt="" class="h-full w-full object-cover"/> <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-zinc-950/40"></div> <div class="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent"></div></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><div class="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950"></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-10 sm:pt-24"><div class="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">`);
    if (posterUrl()) {
      $$renderer2.push(`<!--[0--><div class="mx-auto w-44 shrink-0 sm:mx-0 sm:w-60"><div class="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60 ring-1 ring-black/40"><img${attr("src", posterUrl())}${attr("alt", showData()?.name)} class="h-full w-full object-cover"/></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex min-w-0 flex-1 flex-col gap-5"><div class="flex flex-wrap items-start gap-4"><div class="min-w-0 flex-1"><h1 class="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">${escape_html(showData()?.name)}</h1> `);
    if (showData()?.original_name && showData().original_name !== showData().name) {
      $$renderer2.push(`<!--[0--><p class="mt-1 text-sm text-zinc-400">${escape_html(showData().original_name)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (network()?.logo_path) {
      $$renderer2.push(`<!--[0--><img${attr("src", `${stringify(cfg.image_path)}300${stringify(network().logo_path)}`)}${attr("alt", network().name)} class="h-7 w-auto shrink-0 rounded-md bg-white/90 px-2 py-1 sm:h-9"/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (showData()?.tagline) {
      $$renderer2.push(`<!--[0--><p class="max-w-2xl text-base italic text-zinc-400 sm:text-lg">"${escape_html(showData().tagline)}"</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex flex-wrap items-center gap-2 text-xs">`);
    if (rating()) {
      $$renderer2.push(`<!--[0--><span${attr_class(`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-semibold ${stringify(ratingStyle())}`)}>`);
      Icon($$renderer2, { icon: "mdi:star", class: "h-3.5 w-3.5" });
      $$renderer2.push(`<!----> ${escape_html(rating().toFixed(1))}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (year()) {
      $$renderer2.push(`<!--[0--><span class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">${escape_html(year())}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showData()?.status) {
      $$renderer2.push(`<!--[0--><span${attr_class(`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${stringify(statusStyle())}`)}>`);
      if (showData().in_production) {
        $$renderer2.push(`<!--[0--><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> ${escape_html(showData().status)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showData()?.type) {
      $$renderer2.push(`<!--[0--><span class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">${escape_html(showData().type)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showData()?.adult) {
      $$renderer2.push(`<!--[0--><span class="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 font-semibold text-rose-400">18+</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showData()?.origin_country?.length) {
      $$renderer2.push(`<!--[0--><span class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">${escape_html(showData().origin_country.join(" · "))}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showData()?.original_language) {
      $$renderer2.push(`<!--[0--><span class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 uppercase text-zinc-300">${escape_html(showData().original_language)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showData()?.genres?.length) {
      $$renderer2.push(`<!--[0--><span class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">${escape_html(showData().genres.map((g) => g.name).join(" · "))}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (showData()?.overview) {
      $$renderer2.push(`<!--[0--><p class="max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">${escape_html(showData().overview)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex flex-wrap items-center gap-2">`);
    if (data.session) {
      $$renderer2.push(`<!--[0--><button type="button"${attr_class(`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 ${isFollowed() ? "bg-rose-500/90 text-white hover:bg-rose-500" : "bg-sky-500/90 text-white hover:bg-sky-400"}`)}>`);
      Icon($$renderer2, {
        icon: isFollowed() ? "mdi:bookmark-remove" : "mdi:bookmark-plus",
        class: "h-5 w-5"
      });
      $$renderer2.push(`<!----> ${escape_html(isFollowed() ? "Remove from watchlist" : "Add to watchlist")}</button>`);
    } else {
      $$renderer2.push(`<!--[-1--><a href="/login" class="flex items-center gap-2 rounded-xl bg-sky-500/90 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60">`);
      Icon($$renderer2, { icon: "mdi:google", class: "h-5 w-5" });
      $$renderer2.push(`<!----> Login to follow</a>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (trailer()?.key) {
      $$renderer2.push(`<!--[0--><a${attr("href", `https://www.youtube.com/watch?v=${stringify(trailer().key)}`)} target="_blank" rel="noreferrer" class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60">`);
      Icon($$renderer2, { icon: "mdi:play-circle", class: "h-5 w-5 text-sky-400" });
      $$renderer2.push(`<!----> Watch trailer</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (torrents().length > 0) {
      $$renderer2.push(`<!--[0--><button type="button" class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60">`);
      Icon($$renderer2, { icon: "mdi:magnet", class: "h-5 w-5 text-sky-400" });
      $$renderer2.push(`<!----> Torrents <span class="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-400">${escape_html(torrents().length)}</span></button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div></div></div> <div class="relative mx-auto -mb-10 max-w-7xl px-5 sm:px-10"><div class="grid grid-cols-2 divide-x divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-xl sm:grid-cols-5"><!--[-->`);
    const each_array = ensure_array_like(stats());
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let stat = each_array[i];
      $$renderer2.push(`<div${attr_class(`flex flex-col items-center gap-0.5 px-4 py-4 text-center ${i >= 2 ? "border-t border-white/5 sm:border-t-0" : ""}`)}><span class="text-xs font-medium uppercase tracking-wide text-zinc-500">${escape_html(stat.label)}</span> <span class="text-xl font-bold text-zinc-100 sm:text-2xl">${escape_html(stat.value)}</span> `);
      if (stat.sub) {
        $$renderer2.push(`<!--[0--><span class="text-[10px] text-zinc-500">${escape_html(stat.sub)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></section> `);
    if (showData()?.next_episode_to_air) {
      $$renderer2.push("<!--[0-->");
      const next = showData().next_episode_to_air;
      $$renderer2.push(`<section class="mx-auto max-w-7xl px-5 pt-16 sm:px-10"><div class="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/[0.08] via-zinc-900/60 to-zinc-900/40 p-5 sm:p-6"><div class="flex flex-col gap-4 sm:flex-row sm:items-center">`);
      if (next.still_path) {
        $$renderer2.push(`<!--[0--><div class="w-full shrink-0 overflow-hidden rounded-xl border border-white/10 sm:w-56"><img${attr("src", `${stringify(cfg.image_path)}300${stringify(next.still_path)}`)}${attr("alt", next.name)} class="h-full w-full object-cover"/></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="flex-1"><div class="mb-1 flex items-center gap-2 text-xs font-medium text-sky-400"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400"></span> Next episode · S${escape_html(String(next.season_number).padStart(2, "0"))}E${escape_html(String(next.episode_number).padStart(2, "0"))}</div> <h3 class="text-lg font-bold sm:text-xl">${escape_html(next.name)}</h3> <p class="mt-1 text-sm text-zinc-400">${escape_html(dayjs(next.air_date).format("MMMM D, YYYY"))} <span class="text-zinc-600">·</span> ${escape_html(dayjs(next.air_date).fromNow())}</p> `);
      if (next.overview) {
        $$renderer2.push(`<!--[0--><p class="mt-2 line-clamp-2 max-w-2xl text-sm text-zinc-300">${escape_html(next.overview)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="mx-auto max-w-7xl px-5 py-12 sm:px-10"><div class="grid gap-10 lg:grid-cols-[1fr_320px]"><div class="flex min-w-0 flex-col gap-12">`);
    if (cast().length > 0) {
      $$renderer2.push(`<!--[0--><section><header class="mb-4 flex items-end justify-between"><h2 class="text-lg font-semibold text-zinc-200">Cast</h2> <span class="text-xs text-zinc-500">${escape_html(cast().length)} members</span></header> `);
      Splide_1($$renderer2, {
        options: splideOptions,
        class: "overflow-hidden",
        children: ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(cast());
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let member = each_array_1[$$index_1];
            SplideSlide($$renderer3, {
              children: ($$renderer4) => {
                $$renderer4.push(`<a${attr("href", `/cast/${stringify(member.id)}`)} class="group flex w-32 flex-col items-center gap-2"><div class="relative aspect-square w-32 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition-all duration-300 group-hover:border-sky-500/40 group-hover:ring-2 group-hover:ring-sky-500/20">`);
                if (member.profile_path) {
                  $$renderer4.push(`<!--[0--><img${attr("src", `${stringify(cfg.image_path)}300${stringify(member.profile_path)}`)}${attr("alt", member.name)} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"/>`);
                } else {
                  $$renderer4.push(`<!--[-1--><div class="flex h-full w-full items-center justify-center">`);
                  Icon($$renderer4, { icon: "mdi:account", class: "h-12 w-12 text-zinc-700" });
                  $$renderer4.push(`<!----></div>`);
                }
                $$renderer4.push(`<!--]--></div> <div class="w-full text-center"><p class="truncate text-xs font-semibold text-zinc-200">${escape_html(member.name)}</p> `);
                if (member.character) {
                  $$renderer4.push(`<!--[0--><p class="truncate text-[10px] text-zinc-500">${escape_html(member.character)}</p>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--></div></a>`);
              },
              $$slots: { default: true }
            });
          }
          $$renderer3.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (keyCrew().length > 0) {
      $$renderer2.push(`<!--[0--><section><h2 class="mb-4 text-lg font-semibold text-zinc-200">Crew</h2> <div class="grid gap-3 sm:grid-cols-2"><!--[-->`);
      const each_array_2 = ensure_array_like(keyCrew());
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let section = each_array_2[$$index_2];
        $$renderer2.push(`<div class="rounded-xl border border-white/5 bg-white/[0.02] p-4"><p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">${escape_html(section.label)}</p> <p class="text-sm text-zinc-300">${escape_html(section.people.map((p) => p.name).join(", "))}</p></div>`);
      }
      $$renderer2.push(`<!--]--></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (seasons().length > 0) {
      $$renderer2.push(`<!--[0--><section><header class="mb-4 flex items-end justify-between"><h2 class="text-lg font-semibold text-zinc-200">Seasons</h2> <span class="text-xs text-zinc-500">${escape_html(seasons().length)} total</span></header> `);
      Splide_1($$renderer2, {
        options: splideOptions,
        class: "overflow-hidden",
        children: ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array_3 = ensure_array_like(seasons());
          for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
            let season = each_array_3[$$index_3];
            SplideSlide($$renderer3, {
              children: ($$renderer4) => {
                $$renderer4.push(`<div class="flex w-[200px] flex-col gap-2"><div class="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-zinc-900">`);
                if (season.poster_path) {
                  $$renderer4.push(`<!--[0--><img${attr("src", `${stringify(cfg.image_path)}500${stringify(season.poster_path)}`)}${attr("alt", season.name)} class="absolute inset-0 h-full w-full object-cover" loading="lazy"/>`);
                } else {
                  $$renderer4.push(`<!--[-1--><div class="flex h-full w-full items-center justify-center">`);
                  Icon($$renderer4, {
                    icon: "mdi:file-image-remove",
                    class: "h-16 w-16 text-zinc-700"
                  });
                  $$renderer4.push(`<!----></div>`);
                }
                $$renderer4.push(`<!--]--> `);
                if (season.vote_average) {
                  $$renderer4.push(`<!--[0--><span class="absolute right-2 top-2 rounded-md border border-sky-500/30 bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-300 backdrop-blur-md">${escape_html(season.vote_average.toFixed(1))}</span>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--> `);
                if (season.air_date) {
                  $$renderer4.push(`<!--[0--><span class="absolute left-2 top-2 rounded-md border border-white/20 bg-zinc-950/70 px-2 py-0.5 text-xs font-medium text-zinc-200 backdrop-blur-md">${escape_html(dayjs(season.air_date).format("YYYY"))}</span>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--> <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 to-transparent p-3 pt-8"><p class="text-xs font-medium text-zinc-300">${escape_html(season.episode_count)} episodes</p></div></div> <div><p class="truncate text-sm font-semibold text-zinc-200">${escape_html(season.name)}</p> `);
                if (season.overview) {
                  $$renderer4.push(`<!--[0--><p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">${escape_html(season.overview)}</p>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--></div></div>`);
              },
              $$slots: { default: true }
            });
          }
          $$renderer3.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (videos().length > 1) {
      $$renderer2.push(`<!--[0--><section><h2 class="mb-4 text-lg font-semibold text-zinc-200">Videos</h2> `);
      Splide_1($$renderer2, {
        options: splideOptions,
        class: "overflow-hidden",
        children: ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array_4 = ensure_array_like(videos());
          for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
            let video = each_array_4[$$index_4];
            SplideSlide($$renderer3, {
              children: ($$renderer4) => {
                $$renderer4.push(`<a${attr("href", `https://www.youtube.com/watch?v=${stringify(video.key)}`)} target="_blank" rel="noreferrer" class="group flex w-[280px] flex-col gap-2"><div class="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-zinc-900"><img${attr("src", `https://img.youtube.com/vi/${stringify(video.key)}/maxresdefault.jpg`)}${attr("alt", video.name)} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"/> <div class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"><div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/95">`);
                Icon($$renderer4, { icon: "mdi:play", class: "h-6 w-6 text-zinc-900" });
                $$renderer4.push(`<!----></div></div> <span class="absolute bottom-2 right-2 rounded-md border border-white/20 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-medium text-zinc-200 backdrop-blur-md">${escape_html(video.type)}</span></div> <p class="truncate text-xs font-medium text-zinc-300 group-hover:text-white">${escape_html(video.name)}</p></a>`);
              },
              $$slots: { default: true }
            });
          }
          $$renderer3.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (recommendations().length > 0) {
      $$renderer2.push(`<!--[0--><section><h2 class="mb-4 text-lg font-semibold text-zinc-200">You may also like</h2> `);
      Splide_1($$renderer2, {
        options: splideOptions,
        class: "overflow-hidden",
        children: ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array_5 = ensure_array_like(recommendations());
          for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
            let rec = each_array_5[$$index_5];
            SplideSlide($$renderer3, {
              children: ($$renderer4) => {
                $$renderer4.push(`<a${attr("href", `/show/${stringify(rec.id)}/${stringify(rec.name.replaceAll(" ", "-"))}`)} class="group flex w-[200px] flex-col gap-2"><div class="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-all duration-300 group-hover:border-sky-500/40 group-hover:ring-2 group-hover:ring-sky-500/20">`);
                if (rec.poster_path) {
                  $$renderer4.push(`<!--[0--><img${attr("src", `${stringify(cfg.image_path)}500${stringify(rec.poster_path)}`)}${attr("alt", rec.name)} class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"/>`);
                } else {
                  $$renderer4.push(`<!--[-1--><div class="flex h-full w-full items-center justify-center">`);
                  Icon($$renderer4, {
                    icon: "mdi:file-image-remove",
                    class: "h-16 w-16 text-zinc-700"
                  });
                  $$renderer4.push(`<!----></div>`);
                }
                $$renderer4.push(`<!--]--> `);
                if (rec.vote_average) {
                  $$renderer4.push(`<!--[0--><span class="absolute right-2 top-2 rounded-md border border-sky-500/30 bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-300 backdrop-blur-md">${escape_html(Math.round(rec.vote_average))}</span>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--> `);
                if (rec.first_air_date) {
                  $$renderer4.push(`<!--[0--><span class="absolute left-2 top-2 rounded-md border border-white/20 bg-zinc-950/70 px-2 py-0.5 text-xs font-medium text-zinc-200 backdrop-blur-md">${escape_html(dayjs(rec.first_air_date).format("YYYY"))}</span>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--></div> <p class="truncate text-sm font-medium text-zinc-200 group-hover:text-white">${escape_html(rec.name)}</p></a>`);
              },
              $$slots: { default: true }
            });
          }
          $$renderer3.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <aside class="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start"><div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5"><h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">Details</h3> <dl class="flex flex-col gap-3 text-sm">`);
    if (showData()?.status) {
      $$renderer2.push(`<!--[0--><div class="flex items-start justify-between gap-4"><dt class="text-zinc-500">Status</dt> <dd class="text-right text-zinc-200">${escape_html(showData().status)}</dd></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showData()?.type) {
      $$renderer2.push(`<!--[0--><div class="flex items-start justify-between gap-4"><dt class="text-zinc-500">Type</dt> <dd class="text-right text-zinc-200">${escape_html(showData().type)}</dd></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (network()?.name) {
      $$renderer2.push(`<!--[0--><div class="flex items-start justify-between gap-4"><dt class="text-zinc-500">Network</dt> <dd class="text-right text-zinc-200">${escape_html(network().name)}</dd></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showData()?.first_air_date) {
      $$renderer2.push(`<!--[0--><div class="flex items-start justify-between gap-4"><dt class="text-zinc-500">First aired</dt> <dd class="text-right text-zinc-200">${escape_html(dayjs(showData().first_air_date).format("MMM D, YYYY"))}</dd></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showData()?.last_air_date) {
      $$renderer2.push(`<!--[0--><div class="flex items-start justify-between gap-4"><dt class="text-zinc-500">Last aired</dt> <dd class="text-right text-zinc-200">${escape_html(dayjs(showData().last_air_date).format("MMM D, YYYY"))}</dd></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (countries().length) {
      $$renderer2.push(`<!--[0--><div class="flex items-start justify-between gap-4"><dt class="text-zinc-500">Country</dt> <dd class="text-right text-zinc-200">${escape_html(countries().map((c) => c.name).join(", "))}</dd></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (languages().length) {
      $$renderer2.push(`<!--[0--><div class="flex items-start justify-between gap-4"><dt class="text-zinc-500">Languages</dt> <dd class="text-right text-zinc-200">${escape_html(languages().map((l) => l.english_name).join(", "))}</dd></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (runtime()) {
      $$renderer2.push(`<!--[0--><div class="flex items-start justify-between gap-4"><dt class="text-zinc-500">Runtime</dt> <dd class="text-right text-zinc-200">${escape_html(runtime())} min</dd></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></dl></div> `);
    if (companies().length) {
      $$renderer2.push(`<!--[0--><div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5"><h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">Production</h3> <div class="flex flex-col gap-3"><!--[-->`);
      const each_array_6 = ensure_array_like(companies());
      for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
        let company = each_array_6[$$index_6];
        $$renderer2.push(`<div class="flex items-center gap-3">`);
        if (company.logo_path) {
          $$renderer2.push(`<!--[0--><div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/90"><img${attr("src", `${stringify(cfg.image_path)}300${stringify(company.logo_path)}`)}${attr("alt", company.name)} class="max-h-full max-w-full object-contain"/></div>`);
        } else {
          $$renderer2.push(`<!--[-1--><div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5">`);
          Icon($$renderer2, { icon: "mdi:office-building", class: "h-4 w-4 text-zinc-500" });
          $$renderer2.push(`<!----></div>`);
        }
        $$renderer2.push(`<!--]--> <div class="min-w-0"><p class="truncate text-xs font-medium text-zinc-200">${escape_html(company.name)}</p> `);
        if (company.origin_country) {
          $$renderer2.push(`<!--[0--><p class="text-[10px] text-zinc-500">${escape_html(company.origin_country)}</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (externalLinks().length) {
      $$renderer2.push(`<!--[0--><div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5"><h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">Links</h3> <div class="flex flex-wrap gap-2"><!--[-->`);
      const each_array_7 = ensure_array_like(externalLinks());
      for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
        let link = each_array_7[$$index_7];
        $$renderer2.push(`<a${attr("href", link.url)} target="_blank" rel="noreferrer" class="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white">`);
        Icon($$renderer2, { icon: link.icon, class: "h-3.5 w-3.5" });
        $$renderer2.push(`<!----> ${escape_html(link.label)}</a>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></aside></div></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
