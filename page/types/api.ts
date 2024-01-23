// inferred types barely handle admin so here I just typed them out
export type ILanguagePageData = {
	menuLinks: {
		text: string;
		parentId: number | null;
		position: number;
		href: string;
	}[];
	slides: {
		id: number;
		content: string;
	}[];
	footerContents: {
		emails: string[];
		phoneNumbers: string[];
		location: {
			text: string;
			value: string;
		};
		socials: {
			type: 'facebook' | 'youtube' | 'instagram' | 'twitter';
			value: string;
		}[];
	};
};

export type IPageData = {
	id: number;
	title: string;
	slug: string;
	html: string;
	meta: string;
};
