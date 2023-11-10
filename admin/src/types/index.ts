export type IMenuTreeItem = {
	pageId: number;
	text: string;
	href: string;
	position: number;
	children: IMenuTreeItem[];
};

export type IFilesGrabbedItem = {
	index: number;
	isNew: boolean;
	isDir: boolean;
	buttonElement: HTMLButtonElement;
	preview?: HTMLElement;
};

export type ILocalItem<T> = T & {
	isBeingDeleted?: boolean;
	movedToId?: number | null;
};
export type IDir = {
	id: number;
	parentId: number | null;
	name: string;
	path: string;
};
export type IFile = {
	id: number;
	parentId: number | null;
	name: string;
	title: string;
	alt: string;
	mimetype: string;
	// join in api with dir path?
	src: string;
};
export type ILocalDir = ILocalItem<IDir>;
export type ILocalFile = ILocalItem<IFile>;
export type INewFile = Omit<IFile, 'id' | 'parentId'> & { file: File; movedToId?: number | null; };
