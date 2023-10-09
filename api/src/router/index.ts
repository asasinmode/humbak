import { router } from './trpc';
import { pagesRouter } from './routers/pages';
import { slidesRouter } from './routers/slides';
import { menuLinksRouter } from './routers/menuLinks';
import { footerRouter } from './routers/footer';

export const appRouter = router({
	pages: pagesRouter,
	menuLinks: menuLinksRouter,
	slides: slidesRouter,
	footer: footerRouter,
});

export type AppRouter = typeof appRouter;
