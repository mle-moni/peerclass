import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { mdToHtmlString } from 'App/Helpers/Markdown'

export default class AppProvider {
	public static needsApplication = true

	constructor(protected app: ApplicationContract) { }

	public register() {
		// Register your own bindings
	}

	public async boot() {
		// IoC container is ready
		const edge = await import('@ioc:Adonis/Core/View')
		edge.default.global('mdToHtmlString', mdToHtmlString)
	}

	public async ready() {
		// App is ready
	}

	public async shutdown() {
		// Cleanup, since app is going down
	}
}
