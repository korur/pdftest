import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Use default adapter settings
		adapter: adapter({
			// Only specify what's necessary
			external: ['pdfkit']
		}),
		// Ensure fonts are accessible
		files: {
			lib: 'src/lib'
		}
	}
};

export default config;
