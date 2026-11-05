import * as universal from '../entries/pages/_page.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.DoMpt6Dj.js","_app/immutable/chunks/DKLYg-He.js","_app/immutable/chunks/D6-XlEtG.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/CgtvboPf.js","_app/immutable/chunks/DNH3C0SH.js","_app/immutable/chunks/w1NiSy1O.js","_app/immutable/chunks/_dQij4HL.js","_app/immutable/chunks/CVWVKqzL.js","_app/immutable/chunks/BXtLRJkP.js","_app/immutable/chunks/BJ11XWv8.js","_app/immutable/chunks/DdeOw0Rr.js","_app/immutable/chunks/DoVELJBU.js","_app/immutable/chunks/BNO_G8Sx.js","_app/immutable/chunks/B7xrzPg2.js","_app/immutable/chunks/CPw3JF-c.js","_app/immutable/chunks/CwND_Sou.js","_app/immutable/chunks/21uRk6NV.js","_app/immutable/chunks/D91u9ZMa.js","_app/immutable/chunks/D3X5tNKQ.js","_app/immutable/chunks/Bfc47y5P.js","_app/immutable/chunks/DE4Dolc6.js","_app/immutable/chunks/CLyh7iII.js"];
export const stylesheets = ["_app/immutable/assets/spinner.O2oxl_Fm.css","_app/immutable/assets/2.B8HVQELQ.css","_app/immutable/assets/splide.D7wrQ6zr.css"];
export const fonts = [];
