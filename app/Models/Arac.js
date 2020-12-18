'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Arac extends Model {

  users() {
    return this.belongsTo('App/Models/Arac')
  }

  parkyeris() {
    return this.hasMany('App/Models/Parkyeri')
  }

  lokasyons() {
    return this.belongsToMany('App/Models/Lokasyon').pivotTable('parkyeris')
  }

}

module.exports = Arac
