import { m as head, b as attr_class, e as ensure_array_like } from "../../../chunks/index2.js";
import { D as Default_card } from "../../../chunks/default_card.js";
import { b as show_del } from "../../../chunks/shows.js";
import { E as Empty_shows } from "../../../chunks/empty_shows.js";
import { N as Not_logged } from "../../../chunks/not_logged.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    dayjs.extend(relativeTime);
    let { data } = $$props;
    let show_list = [];
    const delete_show = (id) => {
      show_del(data.supabase, data.session.user.id, id);
      let new_list = show_list.filter((o) => o.id !== id);
      show_list = new_list;
    };
    head("j5a7ut", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>My Shows | Showly</title>`);
      });
    });
    if (data.session) {
      $$renderer2.push(`<!--[0--><div${attr_class(`p-5 flex justify-center w-full ${data.session || show_list.length !== 0 ? "" : "min-h-screen"}`)}><div class="flex justify-center sm:justify-start w-full sm:w-[95%] flex-wrap gap-3"><!---->`);
      {
        if (show_list.length > 0) {
          $$renderer2.push(`<!--[0--><!--[-->`);
          const each_array = ensure_array_like(show_list);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let el = each_array[$$index];
            Default_card($$renderer2, { el, data, delete_show, add_show: null });
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[-1-->");
          Empty_shows($$renderer2);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><div class="flex p-5">`);
      Not_logged($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
