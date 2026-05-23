import { sveltekit } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		target: 'esnext',
		minify: 'terser',
		rollupOptions: {
			output: {
				manualChunks: {
					firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
				}
			}
		}
	},
	optimizeDeps: {
		include: ['firebase/app', 'firebase/auth', 'firebase/firestore']
	}
});
