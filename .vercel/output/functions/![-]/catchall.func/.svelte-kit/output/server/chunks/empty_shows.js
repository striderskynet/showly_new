import "clsx";
import { I as Icon } from "./Icon.js";
function Empty_shows($$renderer) {
  $$renderer.push(`<div class="w-full h-full flex justify-center items-center"><div class="flex flex-col justify-center items-center text-sm">`);
  Icon($$renderer, {
    icon: "mdi:folder-plus-outline",
    class: "text-gray-800 text-7xl m-3"
  });
  $$renderer.push(`<!----> <span class="font-bold text-base text-slate-300">This is empty</span> <span class="text-slate-500">Get started by following some Shows</span> <div class="flex mt-5 gap-5 text-xs"><a href="/hot" class="bg-sky-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-sky-900 duration-300">`);
  Icon($$renderer, { icon: "mdi:fire", class: "text-2xl " });
  $$renderer.push(`<!----> Upcoming shows</a> <a href="/trending" class="bg-sky-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-sky-900 duration-300">`);
  Icon($$renderer, {
    icon: "mdi:format-list-bulleted-triangle",
    class: "text-2xl "
  });
  $$renderer.push(`<!----> Trending shows</a></div></div></div>`);
}
export {
  Empty_shows as E
};
