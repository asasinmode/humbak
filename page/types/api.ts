import type { IMenuLink } from '@humbak/shared';

// typescript cant handle the types and some resolve to any, others just dont load
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

export type ILanguagePageData = {
	menuLinks: IMenuLink[];
	slides: ISlide[];
	slideAspectRatio: string;
	footerContents: IFooterContents;
	meta?: string;
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
