import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Log from 'App/Models/Log'
import Peerclass from 'App/Models/Peerclass'

export default class AdminController {
	public async index({ view }: HttpContextContract) {
		const peerclasses = await Peerclass.query().where('isValidated', false)
		return view.render('admin/index', {
			peerclassesToTreat: peerclasses.length
		})
	}

	public async logs({ view }: HttpContextContract) {
		const query = Log.query().orderBy('created_at', 'desc').limit(30)
		const logs = await query
		return view.render('admin/log', {
			logs
		})
	}

	public async peerclasses({ view, response }: HttpContextContract) {
		const peerclasses = await Peerclass.query().where('isValidated', false)
		if (peerclasses.length === 0) {
			return response.redirect('/admin')
		}
		return view.render('peerclasses/index', { peerclasses, h1Content: 'Toutes les peerclasses en attente de validation', admin: true })
	}

	public async validate(ctx: HttpContextContract) {
		const { auth, params, session, response } = ctx
		const user = auth.user!
		const peerclass = await Peerclass.find(params.id)
		if (!peerclass) {
			session.flash('error', 'Ressource introuvable !')
			return response.redirect('/admin/peerclasses')
		}
		if (!user.isAdmin) {
			session.flash('error', 'Permission non accordée !')
			return response.redirect('/')
		}
		peerclass.isValidated = true
		await peerclass.save()
		Log.create({
			type: 'message',
			msg: `${user.login} validated peerclass with id ${peerclass.id}`
		})
		session.flash('notification', 'Peerclass validée')
		return response.redirect('/admin/peerclasses')
	}
}
