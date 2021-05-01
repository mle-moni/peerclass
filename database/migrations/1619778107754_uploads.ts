import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Uploads extends BaseSchema {
	protected tableName = 'uploads'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id')

			table.string('title', 70)
			table.text('description')
			table.string('file_name')
			table.string('file_extname')
			table.bigInteger('user_id')

			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
