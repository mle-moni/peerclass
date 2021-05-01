import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Application from '@ioc:Adonis/Core/Application'
import Upload from 'App/Models/Upload';
import fs from 'fs'

export default class UploadsController {
	public async index({ auth, view }: HttpContextContract) {
		const user = auth.user!
		await user.preload('uploads')
		const uploads = user.isAdmin() ? await Upload.all() : user.uploads
		return view.render('uploads/index', { uploads })
	}

	public async create({ view }: HttpContextContract) {
		return view.render('uploads/create')
	}

	public async store({ request, response, session, auth }: HttpContextContract) {
		const uploadDetails = await request.validate({
			schema: this.validationSchema,
			messages: this.validationMap,
		})
		const user = auth.user!
		const upload = new Upload()
		upload.title = uploadDetails.title
		upload.description = uploadDetails.description
		upload.userId = user.id
		await upload.save()
		const videoData = uploadDetails.file
		const videoName = `video_${upload.id}.${videoData.extname}`
		await videoData.move(Application.tmpPath('uploads'), {
			name: videoName,
		})
		upload.fileExtname = videoData.extname!
		upload.fileName = videoName
		await upload.save()
		session.flash('notification', `Succès`)
		return response.redirect('/uploads')
	}

	public async show(ctx: HttpContextContract) {
		const { auth, params, response } = ctx
		const user = auth.user!
		const upload = await Upload.find(params.id)
		if (!user.check(upload, '/uploads', ctx)) {
			return
		}
		return response.json({
			id: upload?.id,
			title: upload?.title,
			description: upload?.description,
			user_id: upload?.userId,
		})
	}

	public async edit(ctx: HttpContextContract) {
		const { auth, params, view } = ctx
		const user = auth.user!
		const upload = await Upload.find(params.id)
		if (!user.check(upload, '/uploads', ctx)) {
			return
		}
		return view.render('uploads/edit', { upload })
	}

	public async update(ctx: HttpContextContract) {
		const { auth, params, request, session, response } = ctx
		const user = auth.user!
		const upload = await Upload.find(params.id)
		if (!user.check(upload, '/uploads', ctx) || !upload) {
			return
		}
		const uploadDetails = await request.validate({
			schema: this.validationSchemaEdit,
			messages: this.validationMap,
		})
		upload.title = uploadDetails.title
		upload.description = uploadDetails.description
		await upload.save()
		const videoData = uploadDetails.file
		if (videoData) {
			await upload.deleteVideo()
			const videoName = `video_${upload.id}.${videoData.extname}`
			await videoData.move(Application.tmpPath('uploads'), {
				name: videoName,
			})
			upload.fileExtname = videoData.extname!
			upload.fileName = videoName
			await upload.save()
		}
		session.flash('notification', `Succès`)
		return response.redirect('/uploads')
	}

	public async destroy(ctx: HttpContextContract) {
		const { auth, params, session, response } = ctx
		const user = auth.user!
		const upload = await Upload.find(params.id)
		if (!user.check(upload, '/uploads', ctx)) {
			return
		}
		await upload?.delete()
		session.flash('notification', 'Ressource supprimée')
		return response.redirect('/uploads')
	}

	private validationSchema = schema.create({
		title: schema.string({ trim: true }),
		description: schema.string({ trim: true }),
		file: schema.file({
			size: '600mb',
			extnames: ['mkv', 'mp4', 'avi'],
		}),
	})
	private validationSchemaEdit = schema.create({
		title: schema.string({ trim: true }),
		description: schema.string({ trim: true }),
		file: schema.file.optional({ // send a new file is optional when editing upload
			size: '600mb',
			extnames: ['mkv', 'mp4', 'avi'],
		}),
	})

	private validationMap = {
		'title.required': 'Le nom de la video est requis',
		'description.required': 'La description de la video est requise',
		'file.required': 'Le fichier video de la peerclass est requis',
		'file.file.extname': 'Le fichier envoyé doit etre une video dans un des formats suivants : mp4, mkv, avi',
		'file.file.size': 'Le fichier envoyé doit faire moins de 600mo',
	}

	public async showUpload(ctx: HttpContextContract) {
		const { auth, params, response } = ctx
		const user = auth.user!
		const upload = await Upload.find(params.id)
		if (!user.check(upload, '/uploads', ctx) || !upload) {
			return
		}
		const filePath = upload.getFilePath()
		const mimeType: string | undefined = UploadsController.mimeTypes[upload.fileExtname]
		const stream = fs.createReadStream(filePath)
		response.response.writeHead(200, {
			'Content-Type': mimeType || 'application/octet-stream'
		});
		stream.pipe(response.response);
	}
	private static mimeTypes = {
		'mp4': 'video/mp4',
		'avi': 'video/x-msvideo',
		'mkv': 'video/x-matroska',
	}
}
