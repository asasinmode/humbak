export interface IFilesGrabbedItem {
	index: number;
	isDir: boolean;
	isNew?: boolean;
}

type ILocalItem<T> = T & {
	isBeingDeleted?: boolean;
	movedToId?: number | null;
};
export type ILocalDirectory = ILocalItem<IDirectory>;
export type ILocalFile = ILocalItem<IFile>;
export type INewFile = Omit<IFile, 'id' | 'directoryId' | 'width' | 'height'>
	& { file: File; movedToId?: number | null };
