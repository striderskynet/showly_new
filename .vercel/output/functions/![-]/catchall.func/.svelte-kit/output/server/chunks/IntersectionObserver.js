import "clsx";
function IntersectionObserver_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      once = false,
      top = 0,
      bottom = 0,
      left = 0,
      right = 0,
      children
    } = $$props;
    let intersecting = false;
    $$renderer2.push(`<div class="w-[100%]">`);
    children?.($$renderer2, { intersecting });
    $$renderer2.push(`<!----></div>`);
  });
}
export {
  IntersectionObserver_1 as I
};
