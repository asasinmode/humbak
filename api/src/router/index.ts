import { router } from './trpc';
import { pagesRouter } from './routers/pages';
import { slidesRouter } from './routers/slides';
import { menuLinksRouter } from './routers/menuLinks';

export const appRouter = router({
	pages: pagesRouter,
	menuLinks: menuLinksRouter,
	slides: slidesRouter,
});

export type AppRouter = typeof appRouter;
