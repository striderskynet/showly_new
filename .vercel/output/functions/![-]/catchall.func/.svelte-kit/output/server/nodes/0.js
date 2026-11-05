import * as universal from '../entries/pages/_layout.js';
import * as server from '../entries/pages/_layout.server.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export { server };
export const server_id = "src/routes/+layout.server.js";
export const imports = ["_app/immutable/nodes/0.B5LuvHYO.js","_app/immutable/chunks/BXtLRJkP.js","_app/immutable/chunks/CgtvboPf.js","_app/immutable/chunks/DNH3C0SH.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/_dQij4HL.js","_app/immutable/chunks/w1NiSy1O.js","_app/immutable/chunks/CWRFG4m2.js","_app/immutable/chunks/CxGleuDy.js","_app/immutable/chunks/B7xrzPg2.js","_app/immutable/chunks/BxjY6cpE.js","_app/immutable/chunks/kVd2DfDb.js","_app/immutable/chunks/U-61hwQn.js","_app/immutable/chunks/CwND_Sou.js","_app/immutable/chunks/DoVELJBU.js","_app/immutable/chunks/BJ11XWv8.js","_app/immutable/chunks/DdeOw0Rr.js","_app/immutable/chunks/BNO_G8Sx.js","_app/immutable/chunks/Bfc47y5P.js","_app/immutable/chunks/D3X5tNKQ.js","_app/immutable/chunks/21uRk6NV.js"];
export const stylesheets = ["_app/immutable/assets/stores.C6zDHsay.css","_app/immutable/assets/0.CD54FDqW.css"];
export const fonts = [];
