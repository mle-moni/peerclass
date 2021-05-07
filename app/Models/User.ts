import { DateTime } from 'luxon'
import {
	column,
	BaseModel,
	hasMany,
	HasMany
} from '@ioc:Adonis/Lucid/Orm'
import Peerclass from './Peerclass'

export default class User extends BaseModel {
	@column({ isPrimary: true })
	public id: number

	@column()
	public login: string

	@column({ serializeAs: null })
	public password: string

	@column()
	public rememberMeToken?: string

	@column()
	public isAdmin: boolean

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	public canEdit(ressource: Peerclass) {
		return ressource.userId === this.id || this.isAdmin
	}

	@hasMany(() => Peerclass)
	public peerclasses: HasMany<typeof Peerclass>
}
