export function parsePageHtml(html?: string) {
	if (html === undefined) {
		return undefined;
	} else if (html === '') {
		return '';
	}

	console.log('parsing', html);
	return html;
}
