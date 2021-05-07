import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Peerclass extends BaseModel {
	@column({ isPrimary: true })
	public id: number

	@column()
	public title: string

	@column()
	public description: string

	@column()
	public youtubeId: string

	@column()
	public userId: number

	@column()
	public isValidated: boolean

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	public getUrl() {
		return `https://www.youtube.com/watch?v=${this.youtubeId}`
	}
}
