import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Upload from 'App/Models/Upload'

export default class MaxQueue {
	public async handle(
		{ session, response }: HttpContextContract,
		next: () => Promise<void>
	) {
		// code for middleware goes here. ABOVE THE NEXT CALL

		if (await Upload.maxQueueReached()) {
			session.flash('error', `Le nombre max de videos non validées a été atteint (les videos sont d'abord hebergees sur mon server qui a peu de stockage avant d'etre envoyées sur YouTube donc je peux pas me permettre d'avoir trop de videos sur mon server en meme temps)`)
			return response.redirect('/uploads')
		}

		await next()
	}
}
