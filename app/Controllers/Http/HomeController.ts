import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Log from 'App/Models/Log'
import Upload from 'App/Models/Upload'

export default class HomeController {
	public async home({ view, auth }: HttpContextContract) {
		if (auth.isLoggedIn) {
			const user = auth.user!
			return view.render('home/logged_in', { user })
		} else {
			return view.render('home/logged_out')
		}
	}

	public async admin({ view }: HttpContextContract) {
		const uploads = await Upload.all()
		return view.render('admin/index', {
			uploadsToTreat: uploads.length
		})
	}

	public async logs({ view }: HttpContextContract) {
		const logs = await Log.all()
		return view.render('admin/log', {
			logs
		})
	}
}
