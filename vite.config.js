import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    resolve: {
        alias: {
            $hooks: path.resolve(__dirname, './src/hooks'),
            $routes: path.resolve(__dirname, './src/routes'),
            $components: path.resolve(__dirname, './src/components'),
            $language: path.resolve(__dirname, './src/language'),
            $config: path.resolve(__dirname, './src/config'),
            $assets: path.resolve(__dirname, './src/assets'),
            $lib: path.resolve(__dirname, './src/lib')
        }
    }
});
