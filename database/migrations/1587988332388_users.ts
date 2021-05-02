import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
	protected tableName = 'users'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id').primary()
			table.string('login', 255).notNullable()
			// password will not be used to authenticate so it's fine to set it to a dumb value
			table.string('password', 180).defaultTo('not-used')
			table.string('remember_me_token').nullable()
			table.boolean('is_admin').defaultTo(false)
			table.timestamps(true)
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
