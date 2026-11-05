import { a as attr, b as attr_class, e as ensure_array_like, d as derived, s as store_get, u as unsubscribe_stores, n as await_block } from "../../chunks/index2.js";
import { s as show, a as show_add, b as show_del } from "../../chunks/shows.js";
import { I as Icon } from "../../chunks/Icon.js";
import { N as Not_logged } from "../../chunks/not_logged.js";
import { D as Default_card } from "../../chunks/default_card.js";
import { S as Spinner } from "../../chunks/spinner.js";
/* empty css                      */
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
function SliderControls($$renderer, $$props) {
  $$renderer.push(`<div class="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between"><button type="button"${attr("disabled", true, true)} aria-label="Previous" class="pointer-events-auto -ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black/90 disabled:opacity-0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M15 18l-6-6 6-6"></path></svg></button> <button type="button"${attr("disabled", true, true)} aria-label="Next" class="pointer-events-auto -mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black/90 disabled:opacity-0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M9 18l6-6-6-6"></path></svg></button></div>`);
}
function ShowSlider($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let {
      list = [],
      data,
      add_show,
      delete_show,
      filterFollowed = false
    } = $$props;
    let visible = derived(() => filterFollowed ? list.filter((el) => !store_get($$store_subs ??= {}, "$show", show).includes(el.id)) : list);
    let isDragging = false;
    if (visible().length > 0) {
      $$renderer2.push(`<!--[0--><div class="relative"><div${attr_class("track flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 select-none svelte-22uaa0", void 0, { "cursor-grab": !isDragging, "cursor-grabbing": isDragging })}><!--[-->`);
      const each_array = ensure_array_like(visible());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let el = each_array[$$index];
        $$renderer2.push(`<div class="w-60 shrink-0 snap-start sm:w-48 md:w-52 lg:w-56 xl:w-80">`);
        Default_card($$renderer2, {
          el,
          data,
          add_show,
          delete_show,
          defaultClass: "flex aspect-[1/1.5]",
          shows: false
        });
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]--></div> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      SliderControls($$renderer2);
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    dayjs.extend(relativeTime);
    let { data } = $$props;
    let show_list = [];
    const compare = (a, b) => a.day_diff - b.day_diff;
    function enrichShow(res) {
      const next = res?.next_episode_to_air;
      const nextDate = next?.air_date ? dayjs(next.air_date, "YYYY-MM-DD") : null;
      return {
        ...res,
        day_diff: nextDate ? nextDate.diff(dayjs(), "days") : 1e4,
        day_diff_title: nextDate ? nextDate.fromNow() : void 0
      };
    }
    async function add_show(id, show_item) {
      const enriched = enrichShow(show_item);
      show_list = [enriched, ...show_list].sort(compare);
      try {
        await show_add(data.supabase, data.session.user.id, id);
      } catch (e) {
        console.error("add_show failed", e);
        show_list = show_list.filter((s) => s.id !== id);
      }
    }
    async function delete_show(id) {
      const previous = show_list;
      show_list = show_list.filter((s) => s.id !== id);
      try {
        await show_del(data.supabase, data.session.user.id, id);
      } catch (e) {
        console.error("delete_show failed", e);
        show_list = previous;
      }
    }
    let upcoming_list = derived(() => data.upcoming_list);
    let trending_list = derived(() => data.trending_list);
    $$renderer2.push(`<div class="flex min-h-screen flex-col gap-6 px-5 py-6 sm:px-10"><section><header class="mb-3 flex items-center justify-between"><h2 class="text-lg font-semibold text-slate-200">My Shows</h2></header> `);
    if (!data.session) {
      $$renderer2.push("<!--[0-->");
      Not_logged($$renderer2);
    } else {
      $$renderer2.push(`<!--[1--><div class="flex w-full justify-center py-12">`);
      Spinner($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></section> <section><header class="mb-3 flex items-center justify-between px-2 text-slate-400"><h2 class="text-base font-medium">Upcoming</h2> <a href="/hot" class="z-10 flex items-center gap-1 transition hover:text-white">More `);
    Icon($$renderer2, { icon: "mdi:chevron-right", class: "text-2xl" });
    $$renderer2.push(`<!----></a></header> `);
    await_block(
      $$renderer2,
      upcoming_list(),
      () => {
        $$renderer2.push(`<div class="flex w-full justify-center py-12">`);
        Spinner($$renderer2);
        $$renderer2.push(`<!----></div>`);
      },
      (list) => {
        ShowSlider($$renderer2, {
          list: list.results,
          data,
          add_show,
          delete_show,
          filterFollowed: true
        });
      }
    );
    $$renderer2.push(`<!--]--></section> <section class="mb-16"><header class="mb-3 flex items-center justify-between px-2 text-slate-400"><h2 class="text-base font-medium">Trending</h2> <a href="/trending" class="z-10 flex items-center gap-1 transition hover:text-white">More `);
    Icon($$renderer2, { icon: "mdi:chevron-right", class: "text-2xl" });
    $$renderer2.push(`<!----></a></header> `);
    await_block(
      $$renderer2,
      trending_list(),
      () => {
        $$renderer2.push(`<div class="flex w-full justify-center py-12">`);
        Spinner($$renderer2);
        $$renderer2.push(`<!----></div>`);
      },
      (list) => {
        ShowSlider($$renderer2, {
          list: list.results,
          data,
          add_show,
          delete_show,
          filterFollowed: true
        });
      }
    );
    $$renderer2.push(`<!--]--></section></div>`);
  });
}
export {
  _page as default
};
