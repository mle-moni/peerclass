import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AccountsController {
	public async index({ view }: HttpContextContract) {
		return view.render('account/index')
	}
}
