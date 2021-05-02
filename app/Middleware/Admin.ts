import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Log from 'App/Models/Log'

export default class Admin {
	public async handle(
		{ auth, session, response, request }: HttpContextContract,
		next: () => Promise<void>
	) {
		// code for middleware goes here. ABOVE THE NEXT CALL

		if (!auth.user?.isAdmin) {
			Log.create({
				type: 'error',
				msg: `${auth.user?.login || 'someone'} tried to access ${request.url(true)}`
			})
			session.flash('error', 'Tu dois être admin pour accéder à cette page !')
			return response.redirect('/')
		}

		await next()
	}
}
