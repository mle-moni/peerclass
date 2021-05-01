import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User';
const needle = require('needle');

const ClientOAuth2 = require('client-oauth2')

const intra42auth = new ClientOAuth2({
	clientId: Env.get('INTRA_42_API_ID'),
	clientSecret: Env.get('INTRA_42_API_SECRET'),
	accessTokenUri: 'https://api.intra.42.fr/oauth/token',
	authorizationUri: 'https://api.intra.42.fr/oauth/authorize',
	redirectUri: `${Env.get('APP_URL')}/auth/42/callback`,
	scopes: ['public']
})


export default class AuthController {
	public async login({ response }: HttpContextContract) {
		const uri = intra42auth.code.getUri()
		response.redirect(uri)
	}

	public async callback(ctx: HttpContextContract) {
		const { request, response, session } = ctx
		const url = request.url(true)
		try {
			const user = await intra42auth.code.getToken(url)
			const params = user.sign({
				method: 'get',
				url: 'https://api.intra.42.fr/v2/me'
			})
			const req = await needle('get', params.url, {}, { headers: params.headers });
			if (req.statusCode !== 200) {
				session.flash('error', `La requete sur l'API de 42 à échouée avec le code d\'erreur : ${req.statusCode}`)
				return response.redirect('/')
			}
			return this.loginOrCreate(ctx, req.body.login)
		} catch (error) {
			session.flash('error', `Oh, non ! une erreur inconnue c\'est produite : ${error}`)
			return response.redirect('/')
		}
	}

	private async loginOrCreate(ctx: HttpContextContract, userLogin: string) {
		const { auth, response } = ctx
		let user = await User.findBy('login', userLogin)
		if (!user) {
			// password will not be used to authenticate so it's fine to set it to a dumb value
			user = await User.create({
				login: userLogin,
				password: 'not-used'
			})
		}
		await auth.login(user, true)
		return response.redirect('/')
	}

	public async logout({ auth, response }: HttpContextContract) {
		await auth.logout()
		response.redirect('/')
	}
}
