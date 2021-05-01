import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Admin {
	public async handle(
		{ auth, session, response }: HttpContextContract,
		next: () => Promise<void>
	) {
		// code for middleware goes here. ABOVE THE NEXT CALL

		if (!auth.user?.isAdmin()) {
			session.flash('error', 'Tu dois être admin pour accéder à cette page !')
			return response.redirect('/')
		}

		await next()
	}
}
