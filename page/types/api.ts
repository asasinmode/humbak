import type { IMenuLink } from '@humbak/shared';

export type ISlide = {
	id: number;
	content: string;
};

export type IFooterContents = {
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

// inferred types barely handle admin so here I just typed them out
export type ILanguagePageData = {
	menuLinks: IMenuLink[];
	slides: ISlide[];
	slideAspectRatio: string;
	footerContents: IFooterContents;
};

export type IPageData = {
	id: number;
	title: string;
	slug: string;
	html: string;
	meta: string;
	createdAt: string;
	updatedAt: string;
};
