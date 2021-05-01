import { DateTime } from 'luxon'
import { BaseModel, beforeDelete, column } from '@ioc:Adonis/Lucid/Orm'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs/promises'

export default class Upload extends BaseModel {
	@column({ isPrimary: true })
	public id: number

	@column()
	public title: string

	@column()
	public description: string

	@column()
	public fileName: string

	@column()
	public fileExtname: string

	@column()
	public userId: number

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@beforeDelete()
	public static async beforeDeleteHook(upload: Upload) {
		upload.deleteVideo()
	}
	public async deleteVideo() {
		const filePath = this.getFilePath()
		try {
			await fs.unlink(filePath)
		} catch (error) { }
	}

	public static async maxQueueReached(): Promise<boolean> {
		const uploads = await Upload.all()
		return uploads.length >= 4 // 4 videos at a time on my server at most
	}

	public getFilePath() {
		return Application.tmpPath('uploads') + `/${this.fileName}`
	}
}
