import { s as store_get, m as head, a as attr, c as escape_html, e as ensure_array_like, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import { o as onDestroy, I as Icon } from "../../../../chunks/Icon.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils3.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import { p as page } from "../../../../chunks/stores.js";
/* empty css                                                       */
import { D as Default_card } from "../../../../chunks/default_card.js";
import { b as show_del, a as show_add } from "../../../../chunks/shows.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
    let query = store_get($$store_subs ??= {}, "$page", page).params.slug ?? "";
    let results = [];
    let debounceTimer = null;
    async function add_show(id) {
      if (!data.session) return;
      try {
        await show_add(data.supabase, data.session.user.id, id);
      } catch (e) {
      }
    }
    async function delete_show(id) {
      if (!data.session) return;
      try {
        await show_del(data.supabase, data.session.user.id, id);
      } catch (e) {
      }
    }
    onDestroy(() => {
      clearTimeout(debounceTimer);
    });
    head("fz55b7", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(query ? `Search: ${query}` : "Search")} · Showly</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen px-5 py-6 sm:px-10"><div class="sticky top-0 z-40 -mx-5 mb-6 bg-zinc-950/80 px-5 py-3 backdrop-blur-xl sm:-mx-10 sm:px-10"><form class="mx-auto w-full max-w-2xl"><label for="search" class="sr-only">Search TV shows</label> <div class="group relative">`);
    Icon($$renderer2, {
      icon: "mdi:magnify",
      class: "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2\r\n					       text-zinc-500 transition-colors group-focus-within:text-sky-400"
    });
    $$renderer2.push(`<!----> <input id="search" type="search"${attr("value", query)} placeholder="Search TV shows…" autocomplete="off" spellcheck="false" class="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 py-3 pl-12 pr-28 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus:border-sky-400/50 focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-sky-400/10"/> <div class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">`);
    if (query) {
      $$renderer2.push(`<!--[1--><button type="button" aria-label="Clear search" class="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60">`);
      Icon($$renderer2, { icon: "mdi:close", class: "h-4 w-4" });
      $$renderer2.push(`<!----></button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <button type="submit" class="hidden rounded-xl bg-sky-500/90 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 sm:block">Search</button></div></div></form></div> <div class="mx-auto w-full max-w-7xl">`);
    if (query.trim() && results.length === 0) {
      $$renderer2.push(`<!--[2--><div class="flex flex-col items-center gap-3 py-20 text-center"><div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-white/5">`);
      Icon($$renderer2, { icon: "mdi:magnify-close", class: "h-8 w-8 text-zinc-600" });
      $$renderer2.push(`<!----></div> <div><p class="text-sm font-medium text-zinc-300">No results for "${escape_html(query)}"</p> <p class="mt-1 text-xs text-zinc-500">Try a different title.</p></div></div>`);
    } else if (results.length > 0) {
      $$renderer2.push(`<!--[3--><div class="flex flex-wrap justify-center gap-3 sm:justify-start"><!--[-->`);
      const each_array = ensure_array_like(results);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let el = each_array[$$index];
        Default_card($$renderer2, { el, data, delete_show, add_show });
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><div class="flex flex-col items-center gap-3 py-20 text-center"><div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-white/5">`);
      Icon($$renderer2, {
        icon: "mdi:television-search",
        class: "h-8 w-8 text-zinc-600"
      });
      $$renderer2.push(`<!----></div> <div><p class="text-sm font-medium text-zinc-300">Find your next show</p> <p class="mt-1 text-xs text-zinc-500">Start typing to search.</p></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
