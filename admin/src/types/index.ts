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
