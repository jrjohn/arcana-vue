import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@/presentation': fileURLToPath(new URL('./src/presentation', import.meta.url)),
            '@/domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
            '@/data': fileURLToPath(new URL('./src/data', import.meta.url))
        }
    },
    server: {
        port: 4200,
        proxy: {
            '/api': {
                target: 'https://reqres.in',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            }
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    }
});
