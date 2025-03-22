import type { IUpsertPageInputSchema } from '../../server/api/admin/pages/index.post';

export interface IPageContentsInput extends Pick<IUpsertPageInputSchema, 'html' | 'css' | 'meta'> {}

export interface IJwtPayload {
	id: string;
}
