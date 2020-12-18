'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Lokasyon extends Model {

  aracs() {
    return this.belongsToMany('App/Models/Arac')
  }

  isletmes() {
    return this.belongsToMany('App/Models/Isletme').pivotTable('admins')
  }

}

module.exports = Lokasyon
