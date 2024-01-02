import { hc } from 'hono/client';
import type { InferRequestType, InferResponseType } from 'hono/client';
import type { AppType } from '@humbak/api/src';
import { env } from '~/env';

const client = hc<AppType>(env.VITE_API_URL, {
	// @ts-expect-error args type doesn't matter
	fetch(...args) {
		// @ts-expect-error args type doesn't matter
		return fetch(...args).then(async (r) => {
			if (!r.ok) {
				const contentType = r.headers.get('content-type');
				if (contentType && contentType.slice(0, 16) === 'application/json') {
					return r.json().then((v) => {
						throw new FetchError(v, r.status);
					});
				}

				return r.text().then((v) => {
					throw new FetchError(v, r.status);
				});
			}

			return r;
		});
	},
});

export const useApi = () => client;

type Client = typeof client;

export type IMenuLink = InferResponseType<Client['menuLinks']['$get']>[number];
export type IUniqueLanguage = InferResponseType<Client['languages']['$get']>[number];
export type IListedPage = InferResponseType<Client['pages']['$get']>['items'][number];
export type IPublicListedSlide = InferResponseType<Client['slides']['public']['$get']>[number];
export type IListedSlide = InferResponseType<Client['slides']['$get']>[number];
export type ISlide = InferResponseType<Client['slides'][':id']['$get']>;
export type IUpsertPageInput = InferRequestType<Client['pages']['$post']>['json'];
export type IFooterContents = InferResponseType<Client['footerContents']['$get']>;
export type IDirectory = InferResponseType<Client['directories']['$get']>[number];
export type IFile = InferResponseType<Client['directories'][':id']['$get']>['files'][number];
export type IPutDirectoriesInput = InferRequestType<Client['directories']['$put']>['json'];
