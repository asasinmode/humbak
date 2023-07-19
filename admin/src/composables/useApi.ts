import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@humbak/api/src/router';
import { env } from '~/env';

const client = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: env.VITE_API_URL,
		}),
	],
});

export const useApi = () => client;

const listPagesQuery = client.pages.list.query;
export type Page = Awaited<ReturnType<typeof listPagesQuery>>[number];
