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

export type ListedPage = Awaited<ReturnType<typeof client['pages']['list']['query']>>[number];
export type UniqueLanguage = Awaited<ReturnType<typeof client['pages']['uniqueLanguages']['query']>>[number];
