import { m as head, e as ensure_array_like, b as attr_class, c as escape_html, a as attr } from "../../../chunks/index2.js";
import dayjs from "dayjs";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let ordered_shows = [];
    head("13luymz", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Calendar | Showly</title>`);
      });
    });
    $$renderer2.push(`<div class="flex justify-center w-full pb-20 sm:h-screen"><div class="flex flex-col w-full gap-5 p-5 sm:flex-row sm:flex-wrap"><!--[-->`);
    const each_array = ensure_array_like(Array(dayjs().daysInMonth()));
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      each_array[i];
      const day = dayjs().date(i + 1);
      const today = dayjs().isSame(day);
      const today_formatted = day.format("YYYY-MM-DD");
      if (i === 0) {
        $$renderer2.push(`<!--[0--><!--[-->`);
        const each_array_1 = ensure_array_like(Array(day.day()));
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          each_array_1[$$index];
          $$renderer2.push(`<card class="sm:min-w-[13%] aspect-[1/1] hidden"></card>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <card${attr_class(`sm:w-[13%] sm:aspect-[1/1] rounded-lg p-3 ${ordered_shows[today_formatted] ? "" : "hidden sm:flex"} ${Number(day.format("D")) < Number(dayjs().format("D")) ? "bg-zinc-900" : ""} ${today ? "bg-gray-700" : "bg-gray-900"} text-gray-300 flex items-start`)}><div class="flex flex-col items-center justify-center w-full"><span class="text-xs uppercase">${escape_html(day.format("dddd"))}</span> <span>${escape_html(day.format("D"))}</span> `);
      if (ordered_shows[today_formatted]) {
        $$renderer2.push(`<!--[0--><!--[-->`);
        const each_array_2 = ensure_array_like(ordered_shows[today_formatted]);
        for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
          let os = each_array_2[$$index_1];
          $$renderer2.push(`<a${attr("href", os.address)}${attr_class(`${os.next_episode_to_air?.episode_number === 1 ? "bg-yellow-800" : "bg-sky-800"} text-white rounded p-1 text-sm mb-1 cursor-pointer hover:bg-sky-400 w-[100%] sm:mt-0 mt-2`)}><span class="flex justify-between w-full truncate event-name text-pretty text-clip line-clamp-1"><span>${escape_html(os.name)}</span> `);
          if (Number(day.format("D")) > Number(dayjs().format("D"))) {
            $$renderer2.push("<!--[0-->");
            if (os.next_episode_to_air) {
              $$renderer2.push(`<!--[0--><span>S${escape_html(os.next_episode_to_air.season_number)}E${escape_html(os.next_episode_to_air.episode_number)}</span>`);
            } else {
              $$renderer2.push("<!--[-1-->");
            }
            $$renderer2.push(`<!--]-->`);
          } else if (os.last_episode_to_air) {
            $$renderer2.push(`<!--[1--><span>S${escape_html(os.last_episode_to_air.season_number)}E${escape_html(os.last_episode_to_air.episode_number)}</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></span></a>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></card>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
