import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Logs extends BaseSchema {
	protected tableName = 'logs'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id')

			table.string('type')
			table.text('msg')

			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
