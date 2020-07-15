const Service = require('../Service'),
lib = require('./lib')

class cherwell extends Service {
   route = '/cherwell'
   #handles = lib.handles

   constructor() {
      let result = await lib.requestToken()
      if( result ) {
         return this
      } else { return null }
   }

   // async create( data ) {
   //    return new Promise( ( res, rej ) => {

   //    })
   // }

   // async send( bus_obj ) {
   //    return new Promise( ( res, rej ) => {

   //    })
   // }
}

module.exports = cherwell