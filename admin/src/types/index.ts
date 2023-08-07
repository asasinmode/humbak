export type IMenuTreeItem = {
	pageId: number;
	text: string;
	href: string;
	position: number;
	children: IMenuTreeItem[];
};
