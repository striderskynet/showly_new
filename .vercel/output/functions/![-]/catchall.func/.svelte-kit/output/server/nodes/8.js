import * as server from '../entries/pages/movies/_page.server.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/movies/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/movies/+page.server.js";
export const imports = ["_app/immutable/nodes/8.D_LDR4IB.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/CgtvboPf.js","_app/immutable/chunks/DNH3C0SH.js","_app/immutable/chunks/_dQij4HL.js","_app/immutable/chunks/CVWVKqzL.js","_app/immutable/chunks/w1NiSy1O.js","_app/immutable/chunks/CwND_Sou.js","_app/immutable/chunks/CxGleuDy.js","_app/immutable/chunks/BJ11XWv8.js","_app/immutable/chunks/DdeOw0Rr.js","_app/immutable/chunks/DoVELJBU.js","_app/immutable/chunks/BNO_G8Sx.js","_app/immutable/chunks/B7xrzPg2.js","_app/immutable/chunks/DQTXn65y.js","_app/immutable/chunks/D6-XlEtG.js","_app/immutable/chunks/CLyh7iII.js","_app/immutable/chunks/D3X5tNKQ.js","_app/immutable/chunks/DKLYg-He.js","_app/immutable/chunks/DE4Dolc6.js","_app/immutable/chunks/CQpHGrn1.js","_app/immutable/chunks/21uRk6NV.js"];
export const stylesheets = ["_app/immutable/assets/spinner.O2oxl_Fm.css","_app/immutable/assets/splide.D7wrQ6zr.css"];
export const fonts = [];
