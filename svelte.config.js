import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Customize the adapter configuration
			edge: false,
			external: ['pdfkit'],
			// Include files from the static directory
			copy: [
				{ from: 'static', to: 'static' },
				{ from: 'src/lib/fonts', to: 'server/fonts' }
			]
		}),
		// Ensure fonts are accessible
		files: {
			lib: 'src/lib',
			assets: 'src/assets'
		}
	}
};

export default config;
