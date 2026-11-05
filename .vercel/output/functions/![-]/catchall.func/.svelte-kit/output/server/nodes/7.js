import * as server from '../entries/pages/logout/_page.server.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/logout/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/logout/+page.server.js";
export const imports = ["_app/immutable/nodes/7.BkcJaNM6.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/DdeOw0Rr.js","_app/immutable/chunks/DNH3C0SH.js","_app/immutable/chunks/CgtvboPf.js","_app/immutable/chunks/BNO_G8Sx.js","_app/immutable/chunks/kVd2DfDb.js","_app/immutable/chunks/U-61hwQn.js"];
export const stylesheets = [];
export const fonts = [];
