import { router } from './trpc';
import { pagesRouter } from './routers/pages';

export const appRouter = router({
	pages: pagesRouter,
});

export type AppRouter = typeof appRouter;
