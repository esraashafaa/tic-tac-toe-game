import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/offline-game.js',
                'resources/js/online-game.js'
            ],
            refresh: true,
        }),
    ],
    define: {
        'process.env': {
            VITE_PUSHER_APP_KEY: JSON.stringify(process.env.VITE_PUSHER_APP_KEY),
            VITE_PUSHER_APP_CLUSTER: JSON.stringify(process.env.VITE_PUSHER_APP_CLUSTER),
        },
    },
});
