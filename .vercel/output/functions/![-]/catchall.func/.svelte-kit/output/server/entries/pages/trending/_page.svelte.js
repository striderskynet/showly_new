import { m as head, e as ensure_array_like } from "../../../chunks/index2.js";
import { S as Spinner } from "../../../chunks/spinner.js";
import { D as Default_card } from "../../../chunks/default_card.js";
import { b as show_del, a as show_add } from "../../../chunks/shows.js";
import { I as IntersectionObserver_1 } from "../../../chunks/IntersectionObserver.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let upcoming_list = [];
    const add_show = (id) => {
      show_add(data.supabase, data.session.user.id, id);
    };
    const delete_show = (id) => {
      show_del(data.supabase, data.session.user.id, id);
    };
    head("1aizo1m", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Trending | Showly</title>`);
      });
    });
    $$renderer2.push(`<div class="flex justify-center p-3"><div class="flex flex-wrap justify-center w-full gap-1">`);
    if (upcoming_list.length === 0) {
      $$renderer2.push(`<!--[0--><div class="flex items-center justify-center w-full h-screen scale-150">`);
      Spinner($$renderer2);
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><!--[-->`);
      const each_array = ensure_array_like(upcoming_list);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let el = each_array[$$index];
        Default_card($$renderer2, { el, data, add_show, delete_show });
      }
      $$renderer2.push(`<!--]--> `);
      {
        let children = function($$renderer3, { intersecting }) {
          if (intersecting) {
            $$renderer3.push(`<!--[0-->`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        };
        IntersectionObserver_1($$renderer2, { children });
      }
      $$renderer2.push(`<!---->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
