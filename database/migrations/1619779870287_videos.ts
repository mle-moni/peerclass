import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Videos extends BaseSchema {
	protected tableName = 'videos'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id')

			table.string('title', 70)
			table.text('description')
			table.string('youtube_id')
			table.bigInteger('user_id')

			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
