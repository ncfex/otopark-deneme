'use strict'

const Parkyeri = use('App/Models/Parkyeri')
const Database = use('Database')
const Arac = use('App/Models/Arac')
var moment = require('moment')


class VehicleController {

  //Lokasyonda bos alan bul
  async findFreeLocation(isletme) {

    const locTable = await Database
      .from('lokasyons')
      .where('isletme_id', isletme.id)

    console.log("🚀 ~ file: VehicleController.js ~ line 15 ~ VehicleController ~ findFreeLocation ~ locTable", locTable)

    for (let i = 0; i < locTable.length; i++) {

      if (locTable[i].is_Free == 1) {

        const freeLoc = locTable[i].id
        console.log("🚀 ~ file: VehicleController.js ~ line 25 ~ VehicleController ~ findFreeLocation ~ freeLoc", freeLoc)

        return freeLoc
      }
    }

    const freeLoc = null
    console.log("🚀 ~ file: VehicleController.js ~ line 31 ~ VehicleController ~ findFreeLocation ~ freeLoc", freeLoc)
    return freeLoc

  }

  //ODEME HESAPLAMA SVC.
  async calculatePayment(parkyeriTable) {

    const giris = parkyeriTable.giris
    const cikis = parkyeriTable.cikis

    const moment_giris = moment(giris, "DD MM YYYY hh:mm:ss")

    const moment_cikis = moment(cikis, "DD MM YYYY hh:mm:ss")

    const diff = moment_cikis.diff(moment_giris, 'minutes')

    if (diff < 120) {

      const payment = 0
      return payment

    } else if (120 <= diff) {

      const payment = (parkyeriTable.saatlik_ucret * diff)
      return payment
    }
  }

  //ARAC OLMA KONTROLU SVC.
  async isCarExist(arac) {

    const parkyeri = await Database
      .from('parkyeris')
      .where('arac_id', arac.id)
      .first()

    if (parkyeri == null) {

      return null

    } else {

      return parkyeri
    }
  }

  //PARK HALI KONTROLU SVC.
  async isCarParked(parkyeri) {

    if (parkyeri == null | parkyeri.car_parked == null) {

      return null

    } else if (parkyeri.car_parked == 1) {

      return 1

    } else if (parkyeri.car_parked == 0) {

      return 0
    }
  }

  //ARAC LOKASYONU BULMA SVC.
  async findCarLoc(arac, parkyeriTable) {

    console.log('findCarLoc -> arac_id', arac.id)
    console.log('findCarLoc -> lokasyon_id', parkyeriTable.lokasyon_id)

    return parkyeriTable.lokasyon_id
  }

  //FIND arac_id by plaka from request
  async findAracId(plaka) {

    try {

      const arac = await Database
        .from('aracs')
        .where('plaka', plaka)
        .first()

      if (arac != null) {
        console.log('findAracId', arac.id)

        return arac
      } else {

        console.log('Bu plakali bir arac bulunmamaktadir.')
        return null
      }

    } catch (error) {

      console.log("VehicleController -> findAracId -> error", error)
    }
  }

  //ISLETME BULMA SVC.
  async findIsletme(isletme_id) {

    try {
      const isletme = await Database
        .from('isletmes')
        .where('id', isletme_id)
        .first()
      return isletme
    }

    catch (error) {

      console.log("VehicleController -> findAracId -> error", error)
    }
  }

  // ARAC PARK ETME SVC.
  async ParkVehicle({ request, auth, view, response }) {

    const user = await auth.user

    const vehicles = await Arac
      .query()
      .with('users')
      .with('parkyeris', function (builder) {
        builder.orderBy('giris', 'desc')
      })
      .where('user_id', user.id)
      .fetch()

    const { isletme_id, plaka } = request.all()
    console.log("🚀 ~ file: VehicleController.js ~ line 155 ~ VehicleController ~ ParkVehicle ~ plaka", plaka)

    const isletme = await this.findIsletme(isletme_id)
    console.log("VehicleController -> ParkVehicle -> isletme", isletme)

    const arac = await this.findAracId(plaka)

    const arac_id = arac.id

    console.log("VehicleController -> ParkVehicle -> arac_id", arac.id)

    const parkyeri = await this.isCarExist(arac)
    console.log("VehicleController -> ParkVehicle -> parkyeri", parkyeri)

    const saatlik_ucret = 5

    const araclar = vehicles.toJSON()
    //Check if user is null or not auth.
    if (user) {
      console.log("🚀 ~ file: VehicleController.js ~ line 174 ~ VehicleController ~ ParkVehicle ~ isletme_id", isletme_id)
      console.log("🚀 ~ file: VehicleController.js ~ line 173 ~ VehicleController ~ ParkVehicle ~ plaka", plaka)

      //UPDATE SECTION
      if (parkyeri != null) {

        console.log('if -> is_car_exist')

        const lokasyon_id = await this.findFreeLocation(isletme)
        console.log("🚀 ~ file: VehicleController.js ~ line 185 ~ VehicleController ~ ParkVehicle ~ lokasyon_id", lokasyon_id)

        if (lokasyon_id == null) {

          return response.send("BU LOKASYONDA BOS YER BULUNMAMAKTADIR")

        }

        try {
          if (lokasyon_id != null) {
            //VAR OLAN ARAC PARK EDILMEMIS
            if (parkyeri.car_parked == 0 | parkyeri.car_parked == null) {

              console.log('if -> is_car_exist -> if is parked 0 ')

              const car_parked = 1

              await Parkyeri.create({ car_parked, lokasyon_id, arac_id, saatlik_ucret })

              await Database
                .from('lokasyons')
                .where('id', lokasyon_id)
                .update({ is_Free: 0 })


              return response.route('/users/vehicles')
              /* return response.status(200).json({
                data: parkyeri_new,
                mes: arac.plaka + ' plakali mevcut arac basariyla ' + isletme.id + ' nolu isletmesinin ' + lokasyon_id + '. lokasyonuna parkedildi ve yeni kayit olusturuldu'
              }) */

            } else {
              console.log('if -> is_car_exist -> else if is parked 1 ')


              /* return response.status(400).json({
                msg: arac.plaka + ' nolu arac zaten park halinde'
              }) */
            }
          }
        } catch (error) {
          console.log("ParkArac -> error", error)

          return error
          /* return response.status(400).json({
            error: error.code,
            errorMsg: error,
            //msg: plaka + ' li arac zaten park halinde'
          }) */
        }

      } else {

        console.log('else -> is_car_exist ')

        const car_parked = 1
        console.log("VehicleController -> ParkVehicle -> car_parked", car_parked)


        const lokasyon_id = await this.findFreeLocation(isletme)
        console.log("VehicleController -> ParkVehicle -> lokasyon_id", lokasyon_id)

        if (lokasyon_id == null) {

          return response.send("BU LOKASYONDA BOS YER BULUNMAMAKTADIR")
        }
        await Parkyeri.create({ car_parked, lokasyon_id, arac_id, saatlik_ucret })

        await Database
          .from('lokasyons')
          .where('id', lokasyon_id)
          .update({ is_Free: 0 })

        return response.route('/users/vehicles')

        /* return response.status(200).json({
          data: parkyeri,
          mes: arac.plaka + ' plakali mevcut arac basariyla ' + isletme.id + ' nolu isletmesinin ' + lokasyon_id + '. lokasyonuna parkedildi ve yeni kayit olusturuldu'
        }) */
      }
    }
    return response.route('/users/vehicles')
  }

  //ARACI PARK YERINDEN CIKARMA SVC.
  async unparkVehicle({ request, auth, view, response }) {

    const user = auth.user

    const { plaka } = request.all()
    console.log("🚀 ~ file: VehicleController.js ~ line 252 ~ VehicleController ~ unparkVehicle ~ plaka", plaka)

    const arac = await this.findAracId(plaka)

    const vehicles = await Arac
      .query()
      .with('users')
      .with('parkyeris', function (builder) {
        builder.orderBy('giris', 'desc')
      })
      .where('user_id', user.id)
      .fetch()

    const araclar = vehicles.toJSON()

    const parkyeriTable = await Database
      .from('parkyeris')
      .where('arac_id', arac.id)
      .orderBy('giris', 'desc')
      .first()

    console.log("unparkVehicle -> parkyeriTable.car_parked", parkyeriTable.car_parked)

    const lokasyon_id = await this.findCarLoc(arac, parkyeriTable)

    console.log("unparkVehicle -> lokasyon_id", lokasyon_id)

    if (user) {

      if (parkyeriTable.car_parked == 1) {

        try {

          await Database
            .from('parkyeris')
            .where('arac_id', arac.id)
            .orderBy('giris', 'desc')
            .first()
            .update({ car_parked: 0 })

          const parkyeri_unparked = await Database
            .from('parkyeris')
            .where('arac_id', arac.id)
            .orderBy('giris', 'desc')
            .first()

          const payment = await this.calculatePayment(parkyeri_unparked)

          console.log('Payment -> ', payment)

          await Database
            .from('parkyeris')
            .where('arac_id', arac.id)
            .orderBy('giris', 'desc')
            .first()
            .update({ odeme: payment })

          await Database
            .from('lokasyons')
            .where('id', lokasyon_id)
            .update({ is_Free: 1 })

          return response.route('/users/vehicles')

          /* return response.status(200).json({
            data: parkyeriTable,
            mes: arac.plaka + ' plakali arac parktan cikartildi'
          }) */

        } catch (error) {
          console.log("unparkVehicle -> error", error)
        }
      } else {
        console.log('Arac zaten park halinde degil.')

        return response.route('/users/vehicles')

        /* return response.status(200).json({
          data: parkyeriTable,
          mes: arac.plaka + ' plakali arac park halinde degil'
        }) */
      }
    }
  }
}

module.exports = VehicleController
