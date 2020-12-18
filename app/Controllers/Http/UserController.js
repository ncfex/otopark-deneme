'use strict'

const User = use('App/Models/User')
const Arac = use('App/Models/Arac')
const Database = use('Database')
const Isletme = use('App/Models/Isletme')
const Hash = use('Hash')

class UserController {

  async showLoginForm({ view }) {
    return view.render('login')
  }

  //USER PROFILE VIEW RENDER
  async showProfileForm({ view, auth }) {

    const user = await auth.getUser()

    return view.render('profile')
  }

  //
  async showProfileFormAPI({ response, auth }) {

    const user = auth.user
    console.log("UserController -> showProfile -> user", user)

    return response.send(user)
  }

  //
  async showRegisterForm({ view }) {
    return view.render('register')
  }

  //USER REGISTER SVC.
  async register({ request, response }) {

    const { username, password } = await request.all()

    // create user
    await User.create({
      username: username,
      password: password
    })

    return response.route('/login')
  }

  //USER LOGIN SVC.
  async login({ request, response, auth }) {

    //post request with user login data
    const { username, password } = request.all();
    console.log("UserController -> login -> password", password)
    console.log("UserController -> login -> username", username)

    // retrieve user base on the form data
    const user = await User.query()
      .where('username', username)
      .first()

    if (user) {
      // verify password
      const passwordVerified = await Hash.verify(password, user.password)

      if (passwordVerified) {

        //auth admin data
        const token = await auth.attempt(username, password)
        console.log("UserController -> login -> token", token)

        return response.redirect('/users/profile')
      }
    }
    return response.redirect('/')
  }

  //API USER
  /* async showProfileForm({ auth, response }) {

    const user = auth.user
    console.log("UserController -> showProfile -> user", user)

    return response.send(user)
  }

  //USER SHOW PROFILE SVC.
  async showProfile({ auth, view }) {

    const user = auth.user
    console.log("UserController -> showProfile -> user", user)

    return view.render('profile')

  } */

  //ARAC EKLEME SVC.
  async addVehicle({ request, response, auth }) {

    const user = auth.user
    const user_id = user.id
    const { renk, model, plaka } = request.all()

    try {
      await Arac.create({ renk, model, plaka, user_id })

      return response.redirect('/users/vehicles')
      /* return response.status(200).json({
        data: arac,
        mes: plaka + ' plakali arac ' + user.username + '`a basariyla eklendi'
      }) */
    } catch (error) {
      if (error.code == "ER_NO_REFERENCED_ROW_2") {
        console.log('if')
        return response.status(400).json({
          errcode: error.code,
          err: error,
          mesg: 'kullanici hatasi'
        })
      } else if (error.code == "ER_DUP_ENTRY") {
        console.log('else if')
        return response.status(400).json({
          errcode: error.code,
          err: error,
          mesg: plaka + ' plakali arac zaten bulunuyor'
        })
      }
      return response.status(400).json({
        errcode: error.code,
        err: error,
        mesg: 'bilinmeyen hata'
      })
    }
  }

  //DELETE VEHICLE
  async deleteVehicle({ params, session, response }) {

    const arac = await Arac.find(params.id)
    await arac.delete()

    // Fash success message to session
    session.flash({ notification: 'Task deleted!' })

    return response.redirect('back')
  }

  //USER in ARACLARINI LISTELEME SVC.
  async showVehicles({ auth, view }) {

    try {

      const user = auth.user

      const isletmes = await this.showIsletmes()
      //console.log("🚀 ~ file: UserController.js ~ line 159 ~ UserController ~ showVehicles ~ isletmes", isletmes)

      const vehicles = await Arac
        .query()
        .with('users')
        .with('lokasyons')
        .with('parkyeris', function (builder) {
          builder.orderBy('giris', 'desc')
        })
        .where('user_id', user.id)
        .fetch()

      const lokasyon = await Arac
        .query()
        .with('users')
        .with('lokasyons', function (builder) {
          builder.orderBy('giris', 'desc')
        })
        .where('user_id', user.id)
        .fetch()

      const lokasyonTable = lokasyon.toJSON()
      // console.log("🚀 ~ file: UserController.js ~ line 162 ~ UserController ~ showVehicles ~ lokasyonTable", lokasyonTable)

      /*      if (vehicles == null) {
             return response.status(404).json({
               msg: user.username + " adli kullanicinin herhangi bir araci bulunmamaktadir."
             })
           } */

      const araclar = vehicles.toJSON()
      console.log("UserController -> showVehicles -> araclar", araclar)

      return view.render('vehicle', { araclar, isletmes })
    } catch (error) {

      //console.log("UserController -> showVehicles -> error", error)
    }

    // const vehicle_locations = await Arac
    //   .query()
    //   .with('parkyeris')
    //   .where('arac_id', arac.id)
    //   .fetch()

    // const vehicle_locations = await Database.table('aracs')
    //   .innerJoin('parkyeris', 'aracs.id', 'parkyeris.arac_id')

  }

  //USER SHOW ISLETMES
  async showIsletmes() {

    try {

      const isletme = await Isletme.all()
      console.log("🚀 ~ file: UserController.js ~ line 215 ~ UserController ~ showIsletmes ~ isletme", isletme)

      const isletmes = await isletme.toJSON()

      /*      if (vehicles == null) {
             return response.status(404).json({
               msg: user.username + " adli kullanicinin herhangi bir araci bulunmamaktadir."
             })
           } */

      return isletmes
    } catch (error) {

      console.log("UserController -> showVehicles -> error", error)

    }

  }

  //USER LOGOUT SVC.
  async logout({ auth, response }) {

    await auth.logout()

    return response.redirect('/login')
  }
}


module.exports = UserController
