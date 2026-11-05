import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            runtime: 'nodejs22.x' // 固定 Node 22 运行时
        })
    },
    preprocess: vitePreprocess()
};

export default config;