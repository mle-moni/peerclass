import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Log from 'App/Models/Log'
import Video from 'App/Models/Video'

export default class AdminController {
	public async index({ view }: HttpContextContract) {
		const videos = await Video.query().where('isValidated', false)
		return view.render('admin/index', {
			videosToTreat: videos.length
		})
	}

	public async logs({ view }: HttpContextContract) {
		const logs = await Log.all()
		return view.render('admin/log', {
			logs
		})
	}

	public async videos({ view, response }: HttpContextContract) {
		let videos = await Video.query().where('isValidated', false)
		if (videos.length === 0) {
			return response.redirect('/admin')
		}
		return view.render('videos/index', { videos, h1Content: 'Toutes les videos en attente de validation', admin: true })
	}

	public async validate(ctx: HttpContextContract) {
		const { auth, params, session, response } = ctx
		const user = auth.user!
		const video = await Video.find(params.id)
		if (!video) {
			session.flash('error', 'Ressource introuvable !')
			return response.redirect('/admin/videos')
		}
		if (!user.isAdmin) {
			session.flash('error', 'Permission non accordée !')
			return response.redirect('/')
		}
		video.isValidated = true
		await video.save()
		Log.create({
			type: 'message',
			msg: `${user.login} validated video with id ${video.id}`
		})
		session.flash('notification', 'Video validée')
		return response.redirect('/admin/videos')
	}
}
