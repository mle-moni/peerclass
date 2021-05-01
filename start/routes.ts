/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', 'HomeController.home')
Route.get('/login', 'AuthController.login')
Route.get('/logout', 'AuthController.logout')
Route.get('/auth/42/callback', 'AuthController.callback')

Route.group(() => {
	Route.get('/', 'AccountsController.index')
}).prefix('account').middleware('auth')

Route.group(() => {
	Route.get('/show-upload/:id', 'UploadsController.showUpload')
	Route.resource('/uploads', 'UploadsController').middleware({
		create: 'maxQueue',
		store: 'maxQueue',
	})
	Route.resource('/videos', 'VideosController')
}).middleware('auth')


Route.group(() => {
	Route.get('/admin', 'HomeController.admin')
	Route.get('/admin/upload-all', 'YoutubeController.authToUpload')
	Route.get('/auth/google/callback', 'YoutubeController.callback')
	Route.get('/admin/logs', 'HomeController.logs')
}).middleware(['auth', 'admin'])
