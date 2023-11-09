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

export type IListedPage = Awaited<ReturnType<typeof client['pages']['list']['query']>>[number];
export type IUniqueLanguage = Awaited<ReturnType<typeof client['pages']['uniqueLanguages']['query']>>[number];
export type IUpsertPageInput = Parameters<typeof client['pages']['upsert']['mutate']>[0];
export type IMenuLink = Awaited<ReturnType<typeof client['menuLinks']['list']['query']>>[number];
export type ISlide = Awaited<ReturnType<typeof client['slides']['byId']['query']>>;
export type IListedSlide = Awaited<ReturnType<typeof client['slides']['list']['query']>>[number];
export type IPublicListedSlide = Awaited<ReturnType<typeof client['slides']['listPublic']['query']>>[number];
export type IFooterContents = Awaited<ReturnType<typeof client['footer']['byLanguage']['query']>>;

export type IDir = { id: number; parentId: null | number; name: string; isBeingDeleted?: boolean; movedTo?: number; };
export type INewDir = Omit<IDir, 'id' | 'parentId'>;
export type IFile = { id: number; parentId: null | number; title: string; alt: string; name: string; src: string; mimetype: string; isBeingDeleted?: boolean; movedTo?: number; };
export type INewFile = Omit<IFile, 'id' | 'parentId'> & { file: File; };
