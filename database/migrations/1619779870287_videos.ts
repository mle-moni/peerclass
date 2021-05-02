import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Videos extends BaseSchema {
	protected tableName = 'videos'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id')

			table.string('title', 50)
			table.string('youtube_id', 20)
			table.bigInteger('user_id')
			table.boolean('is_validated').defaultTo(false)

			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
