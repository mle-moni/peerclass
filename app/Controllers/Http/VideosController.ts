import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Video from 'App/Models/Video'
import User from 'App/Models/User'
import Log from 'App/Models/Log'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'

export default class VideosController {
	public async index({ view }: HttpContextContract) {
		const videos = await Video.query().where('isValidated', true)
		return view.render('videos/index', { videos })
	}

	public async create({ view }: HttpContextContract) {
		return view.render('videos/create')
	}

	public async store({ request, response, auth }: HttpContextContract) {
		const videoDetails = await request.validate({
			schema: this.validationSchema,
			messages: this.validationMap,
		})
		const user = auth.user!
		const video = new Video()
		video.title = videoDetails.title
		video.youtubeId = this.getYoutubeId(videoDetails.youtube_url)
		video.userId = user.id
		if (user.isAdmin) {
			video.isValidated = true
		}
		await video.save()
		Log.create({
			type: 'message',
			msg: `Someone posted a video`
		})
		if (!user.isAdmin) {
			this.newVideoEmail(video)
		}
		return response.redirect(`/videos/${video.id}`)
	}

	public async show({ params, session, response, view, auth, request }: HttpContextContract) {
		const user = auth.user!
		const video = await Video.find(params.id)
		if (!video) {
			session.flash('error', 'Ressource introuvable !')
			return response.redirect('/videos')
		}
		if (!video.isValidated && !user.canEdit(video)) {
			session.flash('error', 'Permission non accordée !')
			Log.create({
				type: 'error',
				msg: `${user.login} tried to access ${request.url(true)}`
			})
			return response.redirect('/videos')
		}
		return view.render('videos/show', {
			video
		})
	}

	public async edit(ctx: HttpContextContract) {
		const { auth, params, view } = ctx
		const user = auth.user!
		const video = await Video.find(params.id)
		if (!this.check(user, video, '/videos', ctx)) {
			return
		}
		return view.render('videos/edit', { video })
	}

	public async update(ctx: HttpContextContract) {
		const { auth, params, request, response } = ctx
		const user = auth.user!
		const video = await Video.find(params.id)
		if (!this.check(user, video, '/videos', ctx) || !video) {
			return
		}
		const videoDetails = await request.validate({
			schema: this.validationSchema,
			messages: this.validationMap,
		})
		video.title = videoDetails.title
		video.youtubeId = this.getYoutubeId(videoDetails.youtube_url)
		if (!user.isAdmin && video.isValidated) {
			video.isValidated = false
			this.updateVideoEmail(video)
		}
		await video.save()
		Log.create({
			type: 'message',
			msg: `Someone updated a video`
		})
		return response.redirect(`/videos/${video.id}`)
	}

	public async destroy(ctx: HttpContextContract) {
		const { auth, params, session, response } = ctx
		const user = auth.user!
		const video = await Video.find(params.id)
		if (!this.check(user, video, '/videos', ctx)) {
			return
		}
		await video?.delete()
		Log.create({
			type: 'message',
			msg: `${user.login} deleted a video, title = ${video?.title}, id = ${video?.id})`
		})
		session.flash('notification', 'Ressource supprimée')
		return response.redirect('/videos')
	}

	private validationSchema = schema.create({
		title: schema.string({ trim: true }, [
			rules.maxLength(30)
		]),
		youtube_url: schema.string({ trim: true }, [
			rules.maxLength(50),
			rules.regex(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)
		]),
	})

	private validationMap = {
		'title.required': 'Le nom de la video est requis',
		'title.maxLength': 'Le nom de la video ne dois pas dépasser 30 charactères',
		'youtube_url.required': `L'url de la video est requise`,
		'youtube_url.regex': `L'url de la video doit etre une video Youtube`,
		'youtube_url.maxLength': `L'URL de la video ne dois pas dépasser 50 charactères `,
	}

	private getYoutubeId(url: string) {
		let id = '';
		const slices = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
		if (slices[2] !== undefined) {
			let arr = slices[2].split(/[^0-9a-z_\-]/i);
			id = arr[0];
		}
		else {
			id = url;
		}
		return id;
	}

	private check(user: User, ressource: Video | null, redir: string, { session, response, request }: HttpContextContract) {
		if (!ressource) {
			session.flash('error', 'Ressource introuvable !')
			response.redirect(redir)
			return false
		}
		if (!user.canEdit(ressource)) {
			session.flash('error', 'Permission non accordée !')
			response.redirect(redir)
			Log.create({
				type: 'error',
				msg: `${user.login} tried to access ${request.url(true)}`
			})
			return false
		}
		return true
	}

	private newVideoEmail(video: Video) {
		Mail.send((message) => {
			message
				.from('Admin <admin@mle-moni.fr>')
				.to('mle-moni@student.42.fr')
				.subject('Nouvelle video a valider')
				.htmlView('emails/new_video', {
					video,
					url: Env.get('APP_URL'),
				})
		})
	}

	private updateVideoEmail(video: Video) {
		Mail.send((message) => {
			message
				.from('Admin <admin@mle-moni.fr>')
				.to('mle-moni@student.42.fr')
				.subject('Video a valider')
				.htmlView('emails/update_video', {
					video,
					url: Env.get('APP_URL'),
				})
		})
	}
}
