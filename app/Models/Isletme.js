'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Isletme extends Model {

  lokasyons() {
    return this.hasMany('App/Models/Lokasyon').where('deleted_at', null)
  }

  admins() {
    return this.belongsTo('App/Models/Admin')
  }

}

module.exports = Isletme
