import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		target: 'esnext',
		minify: 'terser'
	},
	optimizeDeps: {
		include: ['firebase/app', 'firebase/auth', 'firebase/firestore']
	}
});
