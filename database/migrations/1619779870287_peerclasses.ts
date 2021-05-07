import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Peerclasses extends BaseSchema {
	protected tableName = 'peerclasses'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id')

			table.string('title', 50)
			table.text('description').defaultTo('')
			table.string('youtube_id', 20).defaultTo('')
			table.bigInteger('user_id')
			table.boolean('is_validated').defaultTo(false)

			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
