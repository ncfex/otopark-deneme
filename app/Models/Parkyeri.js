'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Parkyeri extends Model {

  lokasyons() {
    return this.belongsTo('App/Models/Lokasyon')
  }

  aracs() {
    return this.belongsToMany('App/Models/Arac')
  }

}

module.exports = Parkyeri
