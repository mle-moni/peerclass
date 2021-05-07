import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Peerclass from 'App/Models/Peerclass'

export default class AccountsController {
	public async index({ view }: HttpContextContract) {
		return view.render('account/index')
	}

	public async accountVideosValidated({ auth, view }: HttpContextContract) {
		const user = auth.user!
		const peerclasses = await (Peerclass.query().where('isValidated', true).where('userId', user.id))
		return view.render('peerclasses/index', { peerclasses, h1Content: 'Vos peerclasses validées' })
	}

	public async accountVideosNonValidated({ auth, view }: HttpContextContract) {
		const user = auth.user!
		const peerclasses = await Peerclass.query().where('isValidated', false).where('userId', user.id)
		return view.render('peerclasses/index', { peerclasses, h1Content: 'Vos peerclasses en attente de validation' })
	}
}
