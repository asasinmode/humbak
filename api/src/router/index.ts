import { router } from './trpc';
import { pagesRouter } from './routers/pages';
import { menuLinksRouter } from './routers/menuLinks';

export const appRouter = router({
	pages: pagesRouter,
	menuLinks: menuLinksRouter,
});

export type AppRouter = typeof appRouter;
