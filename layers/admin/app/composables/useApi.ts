import type { NitroFetchRequest } from 'nitropack';
import type { UnwrapRef } from 'vue';
import { FetchError } from 'ofetch';

export const useApi = ((url, options) => {
	if (useState('adminJwt').value) {
		// @ts-expect-error {} is fine
		options ||= {};
		options!.headers ||= {};
		(options!.headers as Record<string, string>).Authorization = `Bearer ${useState('adminJwt').value}`;
	}

	return $fetch(url, options)
		.catch((error) => {
			if (
				error instanceof FetchError
				&& error.response?.status === 401
				&& error.response?.headers.get('x-humbak-logged-out') === 'true') {
				useToast().toast('wylogowano', 'error');
			}

			throw error;
		});
}) as typeof $fetch;

export type IApiReturn<T extends NitroFetchRequest> = NonNullable<UnwrapRef<
	Awaited<ReturnType<typeof useFetch<void, Error, T>>>['data']
>>;

export interface IPublicLanguageData extends IApiReturn<'/api/public/:language'> {};
export type IAdminPublicSlides = IApiReturn<'/api/admin/slides/public'>;
export type IPublicListedSlide = IApiReturn<'/api/admin/slides/public'>[number];
export type IListedSlide = IApiReturn<'/api/admin/slides'>[number];
export interface ISlide extends IApiReturn<'/api/admin/slides/:id'> {};
export interface IFooterContents extends IApiReturn<'/api/admin/footerContents'> {};
export type IDirectory = IApiReturn<'/api/admin/directories'>[number];
export interface IGetDirectoryResponse extends IApiReturn<'/api/admin/directories/:id'> {};
export type IFile = IGetDirectoryResponse['files'][number];
export type IDialogFile = IApiReturn<'/api/admin/files'>['items'][number];
