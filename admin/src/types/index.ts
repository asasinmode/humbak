export type IMenuTreeItem = {
	id: number;
	text: string;
	href: string;
	position: number;
	children: IMenuTreeItem[];
};
