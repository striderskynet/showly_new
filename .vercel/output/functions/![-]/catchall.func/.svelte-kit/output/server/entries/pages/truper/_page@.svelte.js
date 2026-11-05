import { b as attr_class, t as attr_style, k as bind_props, o as stringify, n as await_block, d as derived, e as ensure_array_like, s as store_get, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { r as run } from "../../../chunks/legacy-server.js";
import { D as Default_card } from "../../../chunks/default_card.js";
import { c as cfg } from "../../../chunks/main.js";
import { s as show, b as show_del, a as show_add } from "../../../chunks/shows.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { S as Spinner } from "../../../chunks/spinner.js";
import { E as Empty_shows } from "../../../chunks/empty_shows.js";
import { N as Not_logged } from "../../../chunks/not_logged.js";
/* empty css                         */
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
function TinySlider($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      gap = "0",
      fill = true,
      vertical = false,
      transitionDuration = 300,
      threshold = 30,
      moveThreshold = 0,
      currentIndex = 0,
      shown = [],
      sliderWidth = 0,
      sliderHeight = 0,
      currentScrollPosition = 0,
      maxWidth = 0,
      maxHeight = 0,
      reachedEnd = false,
      distanceToEnd = 0,
      passedThreshold = false,
      passedMoveThreshold = false,
      allowWheel = false,
      end = () => null,
      change = (index) => null,
      onend = end,
      onchange = change,
      onresize = () => null,
      children,
      controls
    } = $$props;
    let isDragging = false;
    let isRepositioning = false;
    let contentElement = void 0;
    function setIndex(index) {
      const length = contentElement.children.length;
      const clamped = Math.max(0, Math.min(index, length - 1));
      snapToPosition({ setIndex: clamped });
      setShown();
    }
    function reposition() {
      isRepositioning = true;
      setIndex(currentIndex);
      requestAnimationFrame(() => isRepositioning = false);
    }
    function snapToPosition({ setIndex: setIndex2 = -1, direction = 1 } = {}) {
      const offsets = getItemOffsets();
      const startIndex = currentIndex;
      currentIndex = 0;
      let index;
      for (index = 0; index < offsets.length; index++) {
        if (setIndex2 != -1) {
          if (index >= setIndex2) break;
        } else if (direction > 0 && offsets[index] > currentScrollPosition || direction < 0 && offsets[index + 1] > currentScrollPosition) {
          break;
        }
      }
      currentIndex = Math.min(index, getContentChildren().length - 1);
      setScrollPosition(offsets[currentIndex], true);
      if (onchange && currentIndex != startIndex) onchange(currentIndex);
    }
    function setScrollPosition(offset, limit = false) {
      currentScrollPosition = offset;
      const size = vertical ? maxHeight : maxWidth;
      const maxSize = vertical ? sliderHeight : sliderWidth;
      const endSize = size - maxSize;
      const sizeKey = vertical ? "clientHeight" : "clientWidth";
      reachedEnd = currentScrollPosition >= endSize;
      if (!reachedEnd) return;
      if (onend) onend();
      if (fill && limit) currentScrollPosition = contentElement[sizeKey] < maxSize ? 0 : endSize;
    }
    function setShown() {
      const offsets = getItemOffsets();
      Array.from(offsets).forEach((offset, index) => {
        if (currentScrollPosition + sliderWidth < offset) return;
        if (!shown.includes(index)) shown = [...shown, index];
      });
    }
    function getItemOffsets() {
      return getContentChildren().map((item) => vertical ? item.offsetTop : item.offsetLeft);
    }
    function getContentChildren() {
      return Array.from(contentElement.children).filter((c) => c instanceof HTMLElement).filter((c) => c.src != "about:blank");
    }
    $$renderer2.push(`<div${attr_class("slider svelte-1gs8ha8", void 0, {
      "dragging": isDragging,
      "passed-threshold": passedThreshold,
      "vertical": vertical
    })} tabindex="-1"><div tabindex="0" class="slider-content svelte-1gs8ha8"${attr_style("", {
      transform: `translate${vertical ? "Y" : "X"}(${stringify(currentScrollPosition * -1)}px)`,
      "transition-duration": `${stringify(isRepositioning ? 0 : transitionDuration)}ms`,
      "--gap": parseFloat(gap || "0") ? gap : null
    })}>`);
    children?.($$renderer2, {
      sliderWidth,
      sliderHeight,
      shown,
      currentIndex,
      setIndex,
      currentScrollPosition,
      maxWidth,
      reachedEnd,
      distanceToEnd
    });
    $$renderer2.push(`<!----></div></div> `);
    controls?.($$renderer2, {
      sliderWidth,
      sliderHeight,
      shown,
      currentIndex,
      setIndex,
      currentScrollPosition,
      maxWidth,
      reachedEnd,
      distanceToEnd
    });
    $$renderer2.push(`<!---->`);
    bind_props($$props, {
      currentIndex,
      shown,
      sliderWidth,
      sliderHeight,
      currentScrollPosition,
      maxWidth,
      maxHeight,
      reachedEnd,
      distanceToEnd,
      passedThreshold,
      passedMoveThreshold,
      setIndex,
      reposition
    });
  });
}
function _page_($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(relativeTime);
    let { data } = $$props;
    let loading = true;
    let show_list = [];
    let loaded_user_id = null;
    function compare(a, b) {
      if (a.day_diff < b.day_diff) return -1;
      if (a.day_diff > b.day_diff) return 1;
      return 0;
    }
    const add_show = (id, showItem) => {
      show_add(data.supabase, data.session.user.id, id);
      show_list = [showItem, ...show_list].sort(compare);
    };
    const delete_show = (id) => {
      show_del(data.supabase, data.session.user.id, id);
      show_list = show_list.filter((o) => o.id !== id);
    };
    const fetch_show = async (id) => {
      try {
        const res = await fetch(cfg.api_show_id + id, cfg.api_options).then((r) => r.json());
        res.day_diff = 1e4;
        if (res.next_episode_to_air) {
          const newDay = dayjs(res.next_episode_to_air.air_date, "YYYY-MM-DD");
          res.day_diff = newDay.diff(dayjs(), "days");
          res.day_diff_title = newDay.fromNow();
        }
        return res;
      } catch (e) {
        console.error("Error loading show", id, e);
        return null;
      }
    };
    const load_shows = async (ids) => {
      const results = await Promise.all(ids.map((id) => fetch_show(id)));
      show_list = results.filter(Boolean).sort(compare);
    };
    const load_following_shows = async () => {
      loading = true;
      show_list = [];
      try {
        const { data: list_of_shows, error } = await data.supabase.from("shows_following").select().eq("user_id", data.session.user.id).order("id", { ascending: true });
        if (error) throw error;
        const list = (list_of_shows ?? []).map((e) => e.show);
        show.set(list);
        await load_shows(list);
      } catch (e) {
        console.error("Error loading following shows", e);
        show_list = [];
      } finally {
        loading = false;
      }
    };
    run(() => {
      const userId = data?.session?.user?.id ?? null;
      if (userId && userId !== loaded_user_id) {
        loaded_user_id = userId;
        load_following_shows();
      } else if (!userId) {
        loaded_user_id = null;
        show_list = [];
        show.set([]);
        loading = false;
      }
    });
    let upcoming_list = derived(() => safePromise(data?.upcoming_list));
    let trending_list = derived(() => safePromise(data?.trending_list));
    const safePromise = (p) => Promise.resolve(p).then((v) => v ?? { results: [] }).catch(() => ({ results: [] }));
    $$renderer2.push(`<div class="flex min-h-screen flex-col p-5"><div class="relative mt-10 flex flex-wrap justify-center gap-3 sm:mt-0 sm:justify-start">`);
    if (data.session) {
      $$renderer2.push("<!--[0-->");
      if (loading) {
        $$renderer2.push(`<!--[0--><div class="flex w-full items-center justify-center py-10">`);
        Spinner($$renderer2);
        $$renderer2.push(`<!----></div>`);
      } else if (show_list.length > 0) {
        $$renderer2.push(`<!--[1--><!---->`);
        {
          {
            let controls = function($$renderer3, { setIndex, currentIndex }) {
              $$renderer3.push(`<button class="absolute top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100">`);
              Icon($$renderer3, { icon: "mdi:chevron-left-circle", class: "text-5xl" });
              $$renderer3.push(`<!----></button> <button class="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100">`);
              Icon($$renderer3, { icon: "mdi:chevron-right-circle", class: "text-5xl" });
              $$renderer3.push(`<!----></button>`);
            };
            TinySlider($$renderer2, {
              gap: "4px",
              controls,
              children: ($$renderer3) => {
                $$renderer3.push(`<!--[-->`);
                const each_array = ensure_array_like(show_list);
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let el = each_array[$$index];
                  Default_card($$renderer3, {
                    el,
                    data,
                    add_show,
                    delete_show,
                    defaultClass: "flex aspect-[1/1.5]",
                    shows: false
                  });
                }
                $$renderer3.push(`<!--]-->`);
              },
              $$slots: { controls: true, default: true }
            });
          }
        }
        $$renderer2.push(`<!---->`);
      } else {
        $$renderer2.push("<!--[-1-->");
        Empty_shows($$renderer2);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      Not_logged($$renderer2);
    }
    $$renderer2.push(`<!--]--></div> <div class="relative mt-5 sm:mt-5">`);
    await_block(
      $$renderer2,
      upcoming_list(),
      () => {
        $$renderer2.push(`<div class="flex w-full flex-1 items-center justify-center">`);
        Spinner($$renderer2);
        $$renderer2.push(`<!----></div>`);
      },
      (list) => {
        $$renderer2.push(`<div class="mb-2 flex w-full justify-between px-10 text-slate-500"><span>Upcoming</span> <a href="/hot" class="z-10 flex items-center gap-1 duration-300 hover:text-white">More `);
        Icon($$renderer2, { icon: "mdi:chevron-right", class: "text-2xl" });
        $$renderer2.push(`<!----></a></div> `);
        {
          let controls = function($$renderer3, { setIndex, currentIndex }) {
            $$renderer3.push(`<button class="absolute top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100">`);
            Icon($$renderer3, { icon: "mdi:chevron-left-circle", class: "text-5xl" });
            $$renderer3.push(`<!----></button> <button class="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100">`);
            Icon($$renderer3, { icon: "mdi:chevron-right-circle", class: "text-5xl" });
            $$renderer3.push(`<!----></button>`);
          };
          TinySlider($$renderer2, {
            gap: "4px",
            controls,
            children: ($$renderer3) => {
              $$renderer3.push(`<!--[-->`);
              const each_array_1 = ensure_array_like(list.results);
              for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                let el = each_array_1[$$index_1];
                if (!store_get($$store_subs ??= {}, "$show", show)?.includes(el.id)) {
                  $$renderer3.push("<!--[0-->");
                  Default_card($$renderer3, {
                    el,
                    data,
                    add_show,
                    delete_show,
                    defaultClass: "flex aspect-[1/1.5]",
                    shows: false
                  });
                } else {
                  $$renderer3.push("<!--[-1-->");
                }
                $$renderer3.push(`<!--]-->`);
              }
              $$renderer3.push(`<!--]-->`);
            },
            $$slots: { controls: true, default: true }
          });
        }
        $$renderer2.push(`<!---->`);
      }
    );
    $$renderer2.push(`<!--]--></div> <div class="relative mb-20 sm:mt-5">`);
    await_block(
      $$renderer2,
      trending_list(),
      () => {
        $$renderer2.push(`<div class="flex w-full flex-1 items-center justify-center">`);
        Spinner($$renderer2);
        $$renderer2.push(`<!----></div>`);
      },
      (list) => {
        $$renderer2.push(`<div class="flex w-full justify-between px-10 text-slate-500"><span>Trending</span> <a href="/trending" class="z-10 flex items-center gap-1 duration-300 hover:text-white">More `);
        Icon($$renderer2, { icon: "mdi:chevron-right", class: "text-2xl" });
        $$renderer2.push(`<!----></a></div> `);
        {
          let controls = function($$renderer3, { setIndex, currentIndex }) {
            $$renderer3.push(`<button class="absolute top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100">`);
            Icon($$renderer3, { icon: "mdi:chevron-left-circle", class: "text-5xl" });
            $$renderer3.push(`<!----></button> <button class="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100">`);
            Icon($$renderer3, { icon: "mdi:chevron-right-circle", class: "text-5xl" });
            $$renderer3.push(`<!----></button>`);
          };
          TinySlider($$renderer2, {
            gap: "4px",
            controls,
            children: ($$renderer3) => {
              $$renderer3.push(`<!--[-->`);
              const each_array_2 = ensure_array_like(list.results);
              for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
                let el = each_array_2[$$index_2];
                if (!store_get($$store_subs ??= {}, "$show", show)?.includes(el.id)) {
                  $$renderer3.push("<!--[0-->");
                  Default_card($$renderer3, {
                    el,
                    data,
                    add_show,
                    delete_show,
                    defaultClass: "flex aspect-[1/1.5]",
                    shows: false
                  });
                } else {
                  $$renderer3.push("<!--[-1-->");
                }
                $$renderer3.push(`<!--]-->`);
              }
              $$renderer3.push(`<!--]-->`);
            },
            $$slots: { controls: true, default: true }
          });
        }
        $$renderer2.push(`<!---->`);
      }
    );
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page_ as default
};
