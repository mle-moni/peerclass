import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Peerclass from 'App/Models/Peerclass'
import User from 'App/Models/User'
import Log from 'App/Models/Log'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'

export default class PeerclassesController {
	public async index({ view }: HttpContextContract) {
		const peerclasses = await Peerclass.query().where('isValidated', true)
		return view.render('peerclasses/index', { peerclasses })
	}

	public async create({ view }: HttpContextContract) {
		return view.render('peerclasses/create')
	}

	public async store({ request, response, auth }: HttpContextContract) {
		const peerclassDetails = await request.validate({
			schema: this.validationSchema,
			messages: this.validationMap,
		})
		const user = auth.user!
		const peerclass = new Peerclass()
		peerclass.title = peerclassDetails.title
		if (peerclassDetails.description) {
			peerclass.description = peerclassDetails.description
		}
		if (peerclassDetails.youtube_url) {
			peerclass.youtubeId = this.getYoutubeId(peerclassDetails.youtube_url)
		}
		peerclass.userId = user.id
		if (user.isAdmin) {
			peerclass.isValidated = true
		}
		await peerclass.save()
		Log.create({
			type: 'message',
			msg: `Someone posted a peerclass`
		})
		if (!user.isAdmin) {
			this.newPeerclassEmail(peerclass)
		}
		return response.redirect(`/peerclasses/${peerclass.id}`)
	}

	public async show({ params, session, response, view, auth, request }: HttpContextContract) {
		const user = auth.user!
		const peerclass = await Peerclass.find(params.id)
		if (!peerclass) {
			session.flash('error', 'Ressource introuvable !')
			return response.redirect('/peerclasses')
		}
		if (!peerclass.isValidated && !user.canEdit(peerclass)) {
			session.flash('error', 'Permission non accordée !')
			Log.create({
				type: 'error',
				msg: `${user.login} tried to access ${request.url(true)}`
			})
			return response.redirect('/peerclasses')
		}
		return view.render('peerclasses/show', {
			peerclass
		})
	}

	public async edit(ctx: HttpContextContract) {
		const { auth, params, view } = ctx
		const user = auth.user!
		const peerclass = await Peerclass.find(params.id)
		if (!this.check(user, peerclass, '/peerclasses', ctx)) {
			return
		}
		return view.render('peerclasses/edit', { peerclass })
	}

	public async update(ctx: HttpContextContract) {
		const { auth, params, request, response } = ctx
		const user = auth.user!
		const peerclass = await Peerclass.find(params.id)
		if (!this.check(user, peerclass, '/peerclasses', ctx) || !peerclass) {
			return
		}
		const peerclassDetails = await request.validate({
			schema: this.validationSchema,
			messages: this.validationMap,
		})
		peerclass.title = peerclassDetails.title
		if (peerclassDetails.description) {
			peerclass.description = peerclassDetails.description
		}
		if (peerclassDetails.youtube_url) {
			peerclass.youtubeId = this.getYoutubeId(peerclassDetails.youtube_url)
		}
		if (!user.isAdmin && peerclass.isValidated) {
			peerclass.isValidated = false
			this.updateVideoEmail(peerclass)
		}
		await peerclass.save()
		Log.create({
			type: 'message',
			msg: `Someone updated a peerclass`
		})
		return response.redirect(`/peerclasses/${peerclass.id}`)
	}

	public async destroy(ctx: HttpContextContract) {
		const { auth, params, session, response } = ctx
		const user = auth.user!
		const peerclass = await Peerclass.find(params.id)
		if (!this.check(user, peerclass, '/peerclasses', ctx)) {
			return
		}
		await peerclass?.delete()
		Log.create({
			type: 'message',
			msg: `${user.login} deleted a peerclass, title = ${peerclass?.title}, id = ${peerclass?.id})`
		})
		session.flash('notification', 'Ressource supprimée')
		return response.redirect('/peerclasses')
	}

	private validationSchema = schema.create({
		title: schema.string({ trim: true }, [
			rules.maxLength(45)
		]),
		description: schema.string.optional({ trim: true }, [
			rules.maxLength(1000)
		]),
		youtube_url: schema.string.optional({ trim: true }, [
			rules.maxLength(50),
			rules.regex(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)
		]),
	})

	private validationMap = {
		'title.required': 'Le nom de la peerclass est requis',
		'title.maxLength': 'Le nom de la peerclass ne dois pas dépasser 45 charactères',
		'description.maxLength': 'La description de la peerclass ne dois pas dépasser 1000 charactères',
		'youtube_url.regex': `L'url de la video doit etre une video Youtube`,
		'youtube_url.maxLength': `L'URL de la peerclass ne dois pas dépasser 50 charactères `,
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

	private check(user: User, ressource: Peerclass | null, redir: string, { session, response, request }: HttpContextContract) {
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

	private newPeerclassEmail(peerclass: Peerclass) {
		Mail.send((message) => {
			message
				.from('Admin <admin@mle-moni.fr>')
				.to('mle-moni@student.42.fr')
				.subject('Nouvelle peerclass a valider')
				.htmlView('emails/new_peerclass', {
					peerclass,
					url: Env.get('APP_URL'),
				})
		})
	}

	private updateVideoEmail(peerclass: Peerclass) {
		Mail.send((message) => {
			message
				.from('Admin <admin@mle-moni.fr>')
				.to('mle-moni@student.42.fr')
				.subject('Peerclass a valider')
				.htmlView('emails/update_peerclass', {
					peerclass,
					url: Env.get('APP_URL'),
				})
		})
	}
}
