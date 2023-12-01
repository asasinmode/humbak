import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { env } from './env';
import { app as footerContentsApp } from './routes/footerContents';
import { app as globalCssApp } from './routes/globalCss';
import { app as languagesApp } from './routes/languages';
import { app as menuLinksApp } from './routes/menuLinks';
import { app as pagesApp } from './routes/pages';
import { app as slidesApp } from './routes/slides';

const app = new Hono();

app.use('/*', cors({
	origin: env.ADMIN_URL,
}));

app.get('/', (c) => {
	return c.text('hi');
});

app.use('/public/*', serveStatic({
	root: '.',
}));

app.route('/footerContents', footerContentsApp);
app.route('/globalCss', globalCssApp);
app.route('/languages', languagesApp);
app.route('/menuLinks', menuLinksApp);
app.route('/pages', pagesApp);
app.route('/slides', slidesApp);

serve({ port: env.PORT, fetch: app.fetch }, (info) => {
	console.log(`server listening on\x1B[36m http://localhost:${info.port}/ \x1B[0m`);
});
