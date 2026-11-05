import { p as sanitize_props, r as rest_props, i as attributes, f as clsx, q as slot, k as bind_props } from "./index2.js";
import { f as fallback } from "./utils2.js";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
function forOwn(object, iteratee) {
  if (object) {
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key !== "__proto__") {
        if (iteratee(object[key], key) === false) {
          break;
        }
      }
    }
  }
  return object;
}
function isObject(subject) {
  return subject !== null && typeof subject === "object";
}
function isEqualDeep(subject1, subject2) {
  if (Array.isArray(subject1) && Array.isArray(subject2)) {
    return subject1.length === subject2.length && !subject1.some((elm, index) => !isEqualDeep(elm, subject2[index]));
  }
  if (isObject(subject1) && isObject(subject2)) {
    const keys1 = Object.keys(subject1);
    const keys2 = Object.keys(subject2);
    return keys1.length === keys2.length && !keys1.some((key) => {
      return !Object.prototype.hasOwnProperty.call(subject2, key) || !isEqualDeep(subject1[key], subject2[key]);
    });
  }
  return subject1 === subject2;
}
function merge(object, source) {
  const merged = object;
  forOwn(source, (value, key) => {
    if (Array.isArray(value)) {
      merged[key] = value.slice();
    } else if (isObject(value)) {
      merged[key] = merge(isObject(merged[key]) ? merged[key] : {}, value);
    } else {
      merged[key] = value;
    }
  });
  return merged;
}
function slice(arrayLike, start, end) {
  return Array.prototype.slice.call(arrayLike, start, end);
}
function apply(func) {
  return func.bind.apply(func, [null].concat(slice(arguments, 1)));
}
function typeOf(type, subject) {
  return typeof subject === type;
}
apply(typeOf, "function");
apply(typeOf, "string");
apply(typeOf, "undefined");
function Splide_1($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "go",
    "sync",
    "class",
    "options",
    "splide",
    "extensions",
    "transition",
    "hasTrack"
  ]);
  $$renderer.component(($$renderer2) => {
    let className = fallback($$props["class"], void 0);
    let options = fallback($$props["options"], () => ({}), true);
    let splide = fallback($$props["splide"], void 0);
    let extensions = fallback($$props["extensions"], void 0);
    let transition = fallback($$props["transition"], void 0);
    let hasTrack = fallback($$props["hasTrack"], true);
    let prevOptions = merge({}, options);
    function go(control) {
      splide?.go(control);
    }
    function sync(target) {
      splide?.sync(target);
    }
    if (splide && !isEqualDeep(prevOptions, options)) {
      splide.options = options;
      prevOptions = merge({}, prevOptions);
    }
    $$renderer2.push(`<div${attributes({
      class: clsx(
        /**
         * Moves the slider by the specified control.
         *
         * @param control - A control pattern.
         */
        /**
         * Syncs the slider with another Splide.
         *
         * @param target - A target splide instance to sync with.
         */
        classNames("splide", className)
      ),
      ...$$restProps
    })}>`);
    if (hasTrack) {
      $$renderer2.push("<!--[0-->");
      SplideTrack($$renderer2, {
        children: ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          slot($$renderer3, $$props, "default", {});
          $$renderer3.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push(`<!--[-1--><!--[-->`);
      slot($$renderer2, $$props, "default", {});
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, {
      class: className,
      options,
      splide,
      extensions,
      transition,
      hasTrack,
      go,
      sync
    });
  });
}
function SplideTrack($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["class"]);
  $$renderer.component(($$renderer2) => {
    let className = fallback($$props["class"], void 0);
    $$renderer2.push(`<div${attributes({
      class: clsx(classNames("splide__track", className)),
      ...$$restProps
    })}><ul class="splide__list"><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></ul></div>`);
    bind_props($$props, { class: className });
  });
}
function SplideSlide($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["class"]);
  $$renderer.component(($$renderer2) => {
    let className = fallback($$props["class"], void 0);
    $$renderer2.push(`<li${attributes({
      class: clsx(classNames("splide__slide", className)),
      ...$$restProps
    })}><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></li>`);
    bind_props($$props, { class: className });
  });
}
export {
  Splide_1 as S,
  SplideSlide as a
};
