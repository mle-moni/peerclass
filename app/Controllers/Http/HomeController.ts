import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class HomeController {
	public async home({ view, auth }: HttpContextContract) {
		if (auth.isLoggedIn) {
			const user = auth.user!
			return view.render('home/logged_in', { user })
		} else {
			return view.render('home/logged_out')
		}
	}
}
