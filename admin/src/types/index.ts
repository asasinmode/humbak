import type { IDirectory, IFile } from '~/composables/useApi';

export type IMenuTreeItem = {
	pageId: number;
	text: string;
	href: string;
	position: number;
	children: IMenuTreeItem[];
};

export type IFilesGrabbedItem = {
	index: number;
	isDir: boolean;
	isNew?: boolean;
};

type ILocalItem<T> = T & {
	isBeingDeleted?: boolean;
	movedToId?: number | null;
};
export type ILocalDirectory = ILocalItem<IDirectory>;
export type ILocalFile = ILocalItem<IFile>;
export type INewFile = Omit<IFile, 'id' | 'directoryId'> & { file: File; movedToId?: number | null; };
