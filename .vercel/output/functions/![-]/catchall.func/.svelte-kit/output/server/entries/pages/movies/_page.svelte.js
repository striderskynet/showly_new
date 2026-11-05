import { a as attr, b as attr_class, c as escape_html, k as bind_props, m as head, n as await_block, d as derived, e as ensure_array_like } from "../../../chunks/index2.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { S as Spinner } from "../../../chunks/spinner.js";
import { c as cfg } from "../../../chunks/main.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { S as Splide_1, a as SplideSlide } from "../../../chunks/SplideSlide.js";
/* empty css                         */
function Movie_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    dayjs.extend(relativeTime);
    let { el = void 0 } = $$props;
    el.air_date = dayjs(el.release_date);
    if (el.poster_path && !el.image) el.poster_path = cfg.image_path + "780" + el.poster_path;
    if (el.image) {
      el.poster_path = el.image;
    }
    el.address = "/movie/" + el.id + "/" + el.title.replaceAll(" ", "-");
    $$renderer2.push(`<a${attr("href", el.address)}${attr_class(`relative group sm:min-w-[200px] w-[200px] flex ${el.poster_path ? "" : "bg-zinc-950 border-gray-600"} rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-slate-800 duration-500`)}>`);
    if (el.poster_path) {
      $$renderer2.push(`<!--[0--><img alt="Poster Imagen"${attr("src", el.poster_path)} class="absolute object-contain w-full group-hover:scale-125 duration-300"/>`);
    } else {
      $$renderer2.push(`<!--[-1--><div class="flex w-full h-full justify-center items-center group-hover:blur duration-300">`);
      Icon($$renderer2, {
        icon: "mdi:file-image-remove",
        class: "text-white w-20 text-9xl "
      });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="absolute bottom-0 flex flex-col w-full bg-gradient-to-t from-black to-transparent backdrop-blur py-2 text-base text-white duration-300 justify-center"><span class="line-clamp-1 text-clip text-pretty truncate text-center capitalize">${escape_html(el.title)}</span></div> <span class="absolute bg-sky-800 text-white line-clamp-1 text-clip text-pretty truncate px-2 text-sm text-center rounded"><span class="group-hover:hidden duration-300 flex">${escape_html(el?.air_date?.fromNow())}</span> <span class="group-hover:flex duration-300 hidden">${escape_html(el?.air_date?.format("MMMM D"))}</span></span></a>`);
    bind_props($$props, { el });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let nowPlaying_list = derived(() => data.nowPlaying_list);
    let popular_list = derived(() => data.popular_list);
    let upcoming_list = derived(() => data.upcoming_list);
    head("1kw5pk2", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Movies | Showly</title>`);
      });
    });
    $$renderer2.push(`<div class="p-10"><div class="mt-5 sm:mt-5">`);
    {
      $$renderer2.push(`<!--[0--><di class="flex items-center justify-center flex-1 w-full">`);
      Spinner($$renderer2);
      $$renderer2.push(`<!----></di>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-5 sm:mt-5">`);
    await_block(
      $$renderer2,
      nowPlaying_list(),
      () => {
        $$renderer2.push(`<di class="flex items-center justify-center flex-1 w-full">`);
        Spinner($$renderer2);
        $$renderer2.push(`<!----></di>`);
      },
      (list) => {
        $$renderer2.push(`<div class="flex justify-between w-full px-10 -mb-5 text-slate-500"><span>Now in Theaters</span></div> `);
        Splide_1($$renderer2, {
          options: {
            arrows: true,
            perPage: "auto",
            focus: "left",
            snap: true,
            pagination: false,
            gap: "12px"
          },
          class: "w-full py-5 overflow-hidden",
          children: ($$renderer3) => {
            $$renderer3.push(`<!--[-->`);
            const each_array_1 = ensure_array_like(list.results);
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let el = each_array_1[$$index_1];
              SplideSlide($$renderer3, {
                class: "flex aspect-[1/1.5]",
                children: ($$renderer4) => {
                  Movie_card($$renderer4, { el });
                },
                $$slots: { default: true }
              });
            }
            $$renderer3.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!---->`);
      }
    );
    $$renderer2.push(`<!--]--></div> <div class="mt-5 sm:mt-5">`);
    await_block(
      $$renderer2,
      popular_list(),
      () => {
        $$renderer2.push(`<di class="flex items-center justify-center flex-1 w-full">`);
        Spinner($$renderer2);
        $$renderer2.push(`<!----></di>`);
      },
      (list) => {
        $$renderer2.push(`<div class="flex justify-between w-full px-10 -mb-5 text-slate-500"><span>Popular</span></div> `);
        Splide_1($$renderer2, {
          options: {
            arrows: true,
            perPage: "auto",
            focus: "left",
            snap: true,
            pagination: false,
            gap: "12px"
          },
          class: "w-full py-5 overflow-hidden",
          children: ($$renderer3) => {
            $$renderer3.push(`<!--[-->`);
            const each_array_2 = ensure_array_like(list.results);
            for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
              let el = each_array_2[$$index_2];
              SplideSlide($$renderer3, {
                class: "flex aspect-[1/1.5]",
                children: ($$renderer4) => {
                  Movie_card($$renderer4, { el });
                },
                $$slots: { default: true }
              });
            }
            $$renderer3.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!---->`);
      }
    );
    $$renderer2.push(`<!--]--></div> <div class="mt-5 sm:mt-5">`);
    await_block(
      $$renderer2,
      upcoming_list(),
      () => {
        $$renderer2.push(`<di class="flex items-center justify-center flex-1 w-full">`);
        Spinner($$renderer2);
        $$renderer2.push(`<!----></di>`);
      },
      (list) => {
        $$renderer2.push(`<div class="flex justify-between w-full px-10 -mb-5 text-slate-500"><span>Upcoming</span></div> `);
        Splide_1($$renderer2, {
          options: {
            arrows: true,
            perPage: "auto",
            focus: "left",
            snap: true,
            pagination: false,
            gap: "12px"
          },
          class: "w-full py-5 overflow-hidden",
          children: ($$renderer3) => {
            $$renderer3.push(`<!--[-->`);
            const each_array_3 = ensure_array_like(list.results);
            for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
              let el = each_array_3[$$index_3];
              SplideSlide($$renderer3, {
                class: "flex aspect-[1/1.5]",
                children: ($$renderer4) => {
                  Movie_card($$renderer4, { el });
                },
                $$slots: { default: true }
              });
            }
            $$renderer3.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!---->`);
      }
    );
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
