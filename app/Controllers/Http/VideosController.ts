import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Video from 'App/Models/Video'

export default class VideosController {
	public async index({ view, request }: HttpContextContract) {
		const id: string | undefined = request.get()['onlyFromUser']
		const user = await User.find(id || 0)
		if (!user) {
			const videos = await Video.all()
			return view.render('videos/index', { videos })
		}
		await user.preload('videos')
		return view.render('videos/index', { videos: user.videos, user })
	}

	public async create({ response }: HttpContextContract) {
		return response.notImplemented({
			msg: 'This endpoint will not be implemented',
		})
	}

	public async store({ response }: HttpContextContract) {
		return response.notImplemented({
			msg: 'This endpoint will not be implemented',
		})
	}

	public async show({ params, session, response, view }: HttpContextContract) {
		const video = await Video.find(params.id)
		if (!video) {
			session.flash('error', 'Ressource introuvable !')
			return response.redirect('/videos')
		}
		return view.render('videos/show', {
			video
		})
	}

	public async edit({ response }: HttpContextContract) {
		return response.notImplemented({
			msg: 'This endpoint is not implemented yet',
		})
	}

	public async update({ response }: HttpContextContract) {
		return response.notImplemented({
			msg: 'This endpoint is not implemented yet',
		})
	}

	public async destroy(ctx: HttpContextContract) {
		const { auth, params, session, response } = ctx
		const user = auth.user!
		const video = await Video.find(params.id)
		if (!user.check(video, '/videos', ctx)) {
			return
		}
		// for now, the youtube video is not deleted, but the video will not be shown on the website
		await video?.delete() // this.check ensures that video is not null, but ts does not know
		session.flash('notification', 'Ressource supprimée')
		return response.redirect('/videos')
	}
}
