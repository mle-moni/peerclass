import { DateTime } from 'luxon'
import {
	column,
	BaseModel,
	hasMany,
	HasMany
} from '@ioc:Adonis/Lucid/Orm'
import Upload from './Upload'
import Video from './Video'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class User extends BaseModel {
	@column({ isPrimary: true })
	public id: number

	@column()
	public login: string

	@column({ serializeAs: null })
	public password: string

	@column()
	public rememberMeToken?: string

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	public isAdmin() {
		return this.login === 'mle-moni'
	}

	public canEdit(ressource: Upload | Video) {
		return ressource.userId === this.id || this.isAdmin()
	}

	public check(ressource: Upload | Video | null, redir: string, { session, response }: HttpContextContract) {
		if (!ressource) {
			session.flash('error', 'Ressource introuvable !')
			response.redirect(redir)
			return false
		}
		if (!this.canEdit(ressource)) {
			session.flash('error', 'Permission non accordée !')
			response.redirect(redir)
			return false
		}
		return true
	}

	@hasMany(() => Upload)
	public uploads: HasMany<typeof Upload>

	@hasMany(() => Video)
	public videos: HasMany<typeof Video>
}
