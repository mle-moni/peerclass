import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Video from 'App/Models/Video'

export default class AccountsController {
	public async index({ view }: HttpContextContract) {
		return view.render('account/index')
	}

	public async accountVideosValidated({ auth, view }: HttpContextContract) {
		const user = auth.user!
		let videos = await (Video.query().where('isValidated', true).where('userId', user.id))
		return view.render('videos/index', { videos, h1Content: 'Vos videos validées' })
	}

	public async accountVideosNonValidated({ auth, view }: HttpContextContract) {
		const user = auth.user!
		let videos = await Video.query().where('isValidated', false).where('userId', user.id)
		return view.render('videos/index', { videos, h1Content: 'Vos videos en attente de validation' })
	}
}
