import { initTRPC } from '@trpc/server';

export const t = initTRPC.create();

export const appRouter = t.router({
	test: t.procedure.query(() => {
		return 'test';
	}),
});

export type AppRouter = typeof appRouter;
