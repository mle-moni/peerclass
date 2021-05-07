const marked = require('marked')
import sanitizeHtml from 'sanitize-html';

function sanitizeText(text: string): string {

	const sanitized: string = sanitizeHtml(text)
	const sanitizedPlusLinkClass = sanitized.replace(/<a/g, `<a class="u-animation-2 color-accent-1"`)
	return sanitizedPlusLinkClass
}

function mdToHtmlString(text: string): string {
	const html = marked(text)
	return sanitizeText(html)
}

export { mdToHtmlString }
