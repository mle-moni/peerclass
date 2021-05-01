import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Env from '@ioc:Adonis/Core/Env'
import Upload from 'App/Models/Upload';
import Video from 'App/Models/Video';
import Log from 'App/Models/Log';
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const fs = require('fs');

export default class YoutubeController {
	public async authToUpload({ response, session }: HttpContextContract) {
		if ((await Upload.all()).length === 0) {
			session.flash('error', `Il n'y a aucun upload en attente de validation`)
			return response.redirect('/admin')
		}
		response.redirect(this.getAuthUrl())
	}

	public callback({ request, response, session }: HttpContextContract) {
		const oauth2Client = this.getAuthClient()
		const code: string = request.get()['code']
		session.flash('notification', `Requete en cours, ne relancez pas l'operation, vous pouvez regarder les logs pour savoir ou ca en est`)
		response.redirect('/admin')
		oauth2Client.getToken(code, (err, token) => {
			if (err) {
				Log.create({
					type: 'error',
					msg: `Error while trying to retrieve access token, code was: ${code}`
				})
			}
			oauth2Client.credentials = token
			this.uploadVideos(oauth2Client)
		})
	}

	private async uploadVideos(oauth2Client) {
		const uploads = await Upload.all()
		for (let upload of uploads) {
			try {
				const youtubeId = await this.uploadVideo(oauth2Client, upload)
				await Video.create({
					title: upload.title,
					description: upload.description,
					youtubeId,
					userId: upload.userId,
				})
				await upload.delete()
			} catch (error) {
				Log.create({
					type: 'error',
					msg: error
				})
			}
		}
	}

	private async uploadVideo(auth, upload: Upload) {
		const service = google.youtube('v3')
		const videoFilePath = upload.getFilePath()
		const { title, description } = upload

		return new Promise<string>((resolve, reject) => {
			service.videos.insert({
				auth: auth,
				part: 'snippet,status',
				requestBody: {
					snippet: {
						title,
						description,
						categoryId: 27, // education
						defaultLanguage: 'fr',
						defaultAudioLanguage: 'fr'
					},
					status: {
						privacyStatus: "unlisted"
					},
				},
				media: {
					body: fs.createReadStream(videoFilePath),
				},
			}, function (err, response) {
				if (err) {
					const errMsg: string = 'The API returned an error: ' + JSON.stringify(err)
					reject(errMsg)
				} else {
					const ID: string = response.data.id
					const msg = `New video uploaded to Youtube, id: ${ID}`
					Log.create({
						type: 'message',
						msg
					})
					resolve(ID)
				}
			});
		});
	}

	private SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
	private redir = Env.get('APP_URL') + '/auth/google/callback'
	private getAuthClient() {
		return new OAuth2(Env.get('GOOGLE_API_ID'), Env.get('GOOGLE_API_SECRET'), this.redir)
	}

	/*
	** get the redirect url to a google auth page in order to generate a token with
	** the code provided in the url when the client is redirected to us
	** e.g. /auth/google/callback?code=xxxxxx
	*/
	private getAuthUrl() {
		const oauth2Client = this.getAuthClient()
		const authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: this.SCOPES
		})
		return authUrl
	}
}
