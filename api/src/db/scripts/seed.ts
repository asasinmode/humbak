import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { slides } from '../schema/slides';
import { db, pool } from '~/db';
import { promptProdContinue } from '~/helpers';
import { pages } from '~/db/schema/pages';
import { contents } from '~/db/schema/contents';
import { menuLinks } from '~/db/schema/menuLinks';

await promptProdContinue();

for (const { pageData, text, parentId, position } of [
	{
		id: 1,
		pageData: { language: 'pl', title: 'Kursy Nurkowania', slug: 'kursy-nurkowania' },
		text: 'Kursy',
		parentId: null,
		position: 0,
	},
	{
		id: 2,
		pageData: { language: 'pl', title: 'Sekcje Nurkowe', slug: 'sekcje-nurkowe' },
		text: 'Sekcje nurkowe',
		parentId: 1,
		position: 0,
	},
	{
		id: 3,
		pageData: { language: 'pl', title: 'Sekcja Brzesko', slug: 'sekcja-brzesko' },
		text: 'Sekcja Brzesko',
		parentId: 2,
		position: 0,
	},
	{
		id: 4,
		pageData: { language: 'pl', title: 'Sekcja Proszówki', slug: 'sekcja-proszowki' },
		text: 'Sekcja Proszówki',
		parentId: 2,
		position: 1,
	},
	{
		id: 5,
		pageData: { language: 'pl', title: 'Sekcja Dąbrowa Górnicza', slug: 'sekcja-dabrowa-gornicza' },
		text: 'Sekcja Dąbrowa Górnicza',
		parentId: 2,
		position: 2,
	},
	{
		id: 6,
		pageData: { language: 'pl', title: 'Sekcja Niepołomice', slug: 'sekcja-niepolomice' },
		text: 'Sekcja Niepołomice',
		parentId: 2,
		position: 3,
	},
	{
		id: 7,
		pageData: { language: 'pl', title: 'Sekcja Przygoda', slug: 'sekcja-przygoda' },
		text: 'Sekcja przygoda',
		parentId: 2,
		position: 4,
	},
	{
		id: 8,
		pageData: { language: 'pl', title: 'OWSD Podstawowy', slug: 'owsd-podstawowy' },
		text: 'OWSD podstawowy',
		parentId: 1,
		position: 1,
	},
	{
		id: 9,
		pageData: { language: 'pl', title: 'Wyprawy i Aktywności', slug: 'wyprawy-i-aktywnosci' },
		text: 'Wyprawy i Aktywności',
		parentId: null,
		position: 1,
	},
	{
		id: 10,
		pageData: { language: 'pl', title: 'Rejsy żeglarskie planowane', slug: 'rejsy-zeglarskie-planowane' },
		text: 'Rejsy żeglarskie planowane',
		parentId: 9,
		position: 0,
	},
	{
		id: 11,
		pageData: { language: 'pl', title: 'Rejsy Ateny zatoka sarońska', slug: 'rejsy-ateny-zatoka-saronska' },
		text: 'Rejsy Ateny zatoka sarońska',
		parentId: 10,
		position: 0,
	},
	{
		id: 12,
		pageData: { language: 'pl', title: 'Wyprawy nurkowe planowane', slug: 'wyprawy-nurkowe-planowane' },
		text: 'Wyprawy nurkowe planowane',
		parentId: 9,
		position: 1,
	},
	{
		id: 13,
		pageData: { language: 'pl', title: 'Safari Nurkowe Egipt - 11-18 listopad', slug: 'safari-nurkowe-egipt' },
		text: 'Safari Nurkowe Egipt - 11-18 listopad',
		parentId: 12,
		position: 0,
	},
	{
		id: 14,
		pageData: { language: 'pl', title: 'Wyprawa nurkowa na Maltę - 11-28 wrzesień', slug: 'wuprawa-nurkowa-malta' },
		text: 'Wyprawa nurkowa na Maltę - 11-28 wrzesień',
		parentId: 12,
		position: 1,
	},
	{
		id: 15,
		pageData: { language: 'pl', title: 'Cennik', slug: 'cennik' },
		text: 'Cennik',
		parentId: null,
		position: 2,
	},
	{
		id: 16,
		pageData: { language: 'pl', title: 'O nas', slug: 'o-nas' },
		text: 'O nas',
		parentId: null,
		position: 3,
	},
	{
		id: 17,
		pageData: { language: 'pl', title: 'uslugi-i-serwis', slug: 'uslugi-i-serwis' },
		text: 'Usługi i serwis',
		parentId: null,
		position: 4,
	},
	{
		id: 18,
		pageData: { language: 'pl', title: 'Sklep', slug: 'sklep' },
		text: 'Sklep',
		parentId: 17,
		position: 0,
	},
	{
		id: 19,
		pageData: { language: 'pl', title: 'Wypożyczalnia', slug: 'wypozyczalnia' },
		text: 'Wypożyczalnia',
		parentId: 17,
		position: 1,
	},
	{
		id: 20,
		pageData: { language: 'pl', title: 'Serwis sprzętu nurkowego', slug: 'serwis-sprzetu-nurkowego' },
		text: 'Serwis sprzętu nurkowego',
		parentId: 17,
		position: 2,
	},
	{
		id: 21,
		pageData: { language: 'pl', title: 'Bony i kariera zawodowa', slug: 'bony-i-kariera-zawodowa' },
		text: 'Bony i kariera zawodowa',
		parentId: 17,
		position: 3,
	},
	{
		id: 22,
		pageData: { language: 'pl', title: 'Baseny', slug: 'baseny' },
		text: 'Baseny',
		parentId: null,
		position: 5,
	},
	{
		id: 23,
		pageData: { language: 'pl', title: 'Kuter port Nieznanowice', slug: 'kuter-port-nieznanowice' },
		text: 'Kuter port Nieznanowice',
		parentId: 22,
		position: 0,
	},
	{
		id: 24,
		pageData: { language: 'pl', title: 'Deep spot', slug: 'deep-spot' },
		text: 'Deep spot',
		parentId: 22,
		position: 1,
	},
	{
		id: 25,
		pageData: { language: 'pl', title: 'Basen Niepołomice', slug: 'basen-niepolomice' },
		text: 'Basen Niepołomice',
		parentId: 22,
		position: 2,
	},
	{
		id: 26,
		pageData: { language: 'pl', title: 'Schowane 1', slug: 'schowane-1' },
		text: 'Schowane 1',
		parentId: -1,
		position: 0,
	},
	{
		id: 27,
		pageData: { language: 'pl', title: 'Schowane 2', slug: 'schowane-2' },
		text: 'Schowane 2',
		parentId: -1,
		position: 0,
	},
	{
		id: 28,
		pageData: { language: 'pl', title: 'Schowane 3', slug: 'schowane-3' },
		text: 'Schowane 3',
		parentId: -1,
		position: 0,
	},
	{
		id: 29,
		pageData: { language: 'pl', title: 'Schowane 4', slug: 'schowane-4' },
		text: 'Schowane 4',
		parentId: -1,
		position: 0,
	},
	{
		id: 30,
		pageData: { language: 'pl', title: 'Schowane 5', slug: 'schowane-5' },
		text: 'Schowane 5',
		parentId: -1,
		position: 0,
	},
	{
		id: 31,
		pageData: { language: 'en', title: 'Schowane 6', slug: 'schowane-6' },
		text: 'Schowane 6',
		parentId: -1,
		position: 0,
	},
]) {
	const [{ insertId: pageId }] = await db
		.insert(pages)
		.values(pageData);

	await Promise.all([
		db.insert(menuLinks).values({ text, pageId, position, parentId }),
		db.insert(contents).values({ pageId }),
		writeFile(fileURLToPath(new URL(`../../../public/stylesheets/${pageId}.css`, import.meta.url)), ''),
	]);
}

for (const { name, content, isHidden, language } of [
	{
		name: 'slide1', language: 'pl', content: `<div>
<h6>1</h6>
</div>`,
	},
	{
		name: 'slide2', language: 'pl', content: `<div>
<h6>2</h6>
</div>`,
	},
	{
		name: 'slide3',
		language: 'pl',
		content: `<div>
<h6>3</h6>
</div>`,
		isHidden: true,
	},
	{
		name: 'slideOne', language: 'en', content: `<div>
<h6>One</h6>
</div>`,
	},
]) {
	await db.insert(slides).values({ name, content, isHidden, language });
}

await pool.end();
