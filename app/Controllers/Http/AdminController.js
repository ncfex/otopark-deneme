'use strict'

const Admin = use('App/Models/Admin')
const Lokasyon = use('App/Models/Lokasyon')
const Isletme = use('App/Models/Isletme')
const Hash = use('Hash')
const Database = use('Database')

class AdminController {

  //LOGIN FORM
  async showLoginForm({ view }) {
    return view.render('adminLogin')
  }

  //REGISTER FORM
  async showRegisterForm({ view }) {
    return view.render('adminRegister')
  }

  //PROFILE FORM
  async showProfileForm({ view, auth }) {

    const admin = await auth.getUser()

    return view.render('adminProfile')
  }

  //ADMIN REGISER SVC.
  async adminRegister({ request, response, auth }) {

    const { username, password } = await request.all()

    // create user
    await Admin.create({
      username: username,
      password: password
    })

    return response.route('/adminLogin')
  }

  //ADMIN LOGIN SVC.
  async adminLogin({ request, response, auth, session }) {
    //post request with user login data
    const { username, password } = request.all();
    console.log("UserController -> login -> password", password)
    console.log("UserController -> login -> username", username)

    // retrieve user base on the form data
    const admin = await Admin.query()
      .where('username', username)
      .first()

    if (admin) {
      // verify password
      const passwordVerified = await Hash.verify(password, admin.password)

      if (passwordVerified) {

        const a = passwordVerified
        //auth admin data
        const token = await auth.authenticator('admin').attempt(username, password)
        console.log("🚀 ~ file: AdminController.js ~ line 60 ~ AdminController ~ adminLogin ~ token", token)

        session.put('admin', 1)

        return response.redirect('/admin/profile')
      }
    }
    return response.redirect('/')
  }

  async logout({ auth }) {
    try {
      const user = auth.user
      console.log("logout -> user", user)
      const token = auth.getAuthHeader()
      console.log("logout -> token", token)

      await user
        .tokens()
        .where('token', token)
        .update({ is_revoked: true })
    } catch (error) {
      console.log("logout -> error", error)
    }
  }

  //ISLETME ID
  async findIsletme(isletme_adi) {

    const isletme = await Database
      .from('isletmes')
      .where('isletme_adi', isletme_adi)
      .first()
    return isletme
  }

  //ISLETME EKLEME SVC.
  async addIsletme({ request, response, auth }) {

    const { isletme_adi, lokasyonAdet } = await request.all()

    try {
      //MIDDLEWARE [auth:admin] user.
      const adminAuth = await auth.user
      console.log("IsletmeController -> addIsletme -> adminAuth", adminAuth)

      const admin_id = adminAuth.id

      if (adminAuth) {

        await Isletme.create({ isletme_adi, admin_id })

        const isletme = await this.findIsletme(isletme_adi)
        console.log("🚀 ~ file: AdminController.js ~ line 104 ~ AdminController ~ addIsletme ~ isletme", isletme)

        const isletme_id = isletme.id

        const is_Free = 1

        var name = 'lok'

        for (var index = 0; index < lokasyonAdet; index++) {

          const iToS = index.toString()

          name = name + iToS

          await Lokasyon.create({ isletme_id, is_Free, name })

          name = 'lok'
        }

        // await this.addIsletmeLokasyon(lokasyonAdet, isletme_id)
        return response.route("/admin/isletmes")
      }
    } catch (error) {
      if (error.code == 'ER_DUP_ENTRY') {

        return response.status(200).json({
          error: 'ER_DUP_ENTRY',
          mes: isletme_adi + ' isminde bir isletme bulunuyor'
        })
      }
      console.log("register -> error", error)
    }
  }

  //ISLETME LOKASYON EKLEME SVC.
  /*  async addIsletmeLokasyon({ lokasyonAdet, isletme_id }) {

     const is_Free = 1

     var name = 'lok'

     for (var index = 0; index < lokasyonAdet; index++) {

       const iToS = index.toString()

       name = name + iToS

       await Lokasyon.create({ isletme_id, is_Free, name })

       name = 'lok'
     }
   } */

  //KULLANICININ ISLETMELERINI GOSTER
  async showIsletmes({ response, auth, view }) {

    const admin = await auth.authenticator('admin').user
    //console.log("🚀 ~ file: AdminController.js ~ line 155 ~ AdminController ~ showIsletmes ~ admin", admin)

    const isletmes = await Isletme
      .query()
      .with('admins')
      .with('lokasyons', function (builder) {
        builder.where('is_Free', 1).orderBy('name', 'asc')
      })
      .where('admin_id', admin.id)
      .fetch()

    // const lokasyons = await Isletme
    //   .query()
    //   .with('lokasyons')
    //   .where('admin_id', admin.id)
    //   .fetch()

    //const lokasyonlar = lokasyons.toJSON()
    //console.log("🚀 ~ file: AdminController.js ~ line 182 ~ AdminController ~ showIsletmes ~ lokasyons", lokasyonlar)

    const isletmeler = isletmes.toJSON()
    console.log("🚀 ~ file: AdminController.js ~ line 176 ~ AdminController ~ showIsletmes ~ isletmeler", isletmeler)

    // for (let index = 0; index < lokasyonlar.length; index++) {
    //   for (let i = 0; i < lokasyonlar[index].lokasyons.length; i++) {
    //     if (lokasyonlar[index].lokasyons[i].is_Free == 1) {

    //       console.log("🚀 ~ file: AdminController.js ~ line 199 ~ AdminController ~ showIsletmes ~ is_Free", lokasyonlar[index].lokasyons[i].is_Free)
    //       bos[index] = await lokasyonlar[index].lokasyons
    //     }
    //   }
    // }

    return view.render('isletme', { isletmeler })

    /* for (let a = 0; a < isletmes.length; a++) {
      for (let b = 0; b < isletmes.lokasyons.length; b++) {
        if (isletmeler[a].lokasyons[b].is_Free == 1) {
          let freeloks = isletmeler[a].lokasyons[b]
          console.log("🚀 ~ file: AdminController.js ~ line 193 ~ AdminController ~ showIsletmes ~ freeloks", freeloks)
        } else {
          console.log("🚀")
        }
      }
    } */
  }

}



module.exports = AdminController
