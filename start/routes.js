'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('home')



//USER REG_LOG
// Route
//   .post('/register', 'UserController.register')

// Route
//   .post('/login', 'UserController.login')


//User routes
Route.group(() => {

  Route
    .get('/users/profile', 'UserController.showProfileForm')

  Route
    .get('/users/vehicles', 'UserController.showVehicles')

  Route
    .delete('/users/vehicles/:id', 'UserController.deleteVehicle')

  Route
    .post('/users/vehicles/addVehicle', 'UserController.addVehicle')

  Route
    .post('/users/vehicles/parkVehicle', 'VehicleController.ParkVehicle')

  Route
    .post('/users/vehicles/unparkVehicle', 'VehicleController.unparkVehicle')

}).middleware(['auth'])

// Route
//   .get('/api/users/profile', 'UserController.showProfileFormAPI').middleware('auth:user')


//Isletme routers
Route.group(() => {

  Route
    .get('/admin/profile', 'AdminController.showProfileForm')

  Route
    .get('/admin/isletmes', 'AdminController.showIsletmes')

  Route
    .post('/admin/isletme/addIsletme', 'AdminController.addIsletme')

}).middleware(['auth:admin'])




//VIEW EXAMPLE
Route
  .get('/login', 'UserController.showLoginForm')

Route
  .post('/login', 'UserController.login').as('login')

Route
  .get('/register', 'UserController.showRegisterForm')

Route
  .post('/register', 'UserController.register').as('register')




//ADMIN REG_LOG
Route
  .get('/adminRegister', 'AdminController.showRegisterForm').as('adminRegister')

Route
  .post('/adminRegister', 'AdminController.adminRegister')

Route
  .get('/adminLogin', 'AdminController.showLoginForm').as('adminLogin')

Route
  .post('/adminLogin', 'AdminController.adminLogin')

Route
  .get('/logout', 'UserController.logout')
