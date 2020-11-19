const ENV = require('../../../.helper').CONF.env

let { request } = require('../../../.helper'),
model = require('../../.models').user

const _user = {
   async get( name ) {
      let get = request('json', 200, 404)
      let data = await get(`${ENV.domain}/s/cherwell/users/${name}`)
      if( data ) {
         console.log( data )
         return data
      } else {
         return null
      }
   },

   async getUsers( team ) {
      let get = request('json', 200, 404),
      data = await get(`${ENV.domain}/s/cherwell/users?team=${team}`)
      if( data ) {
         let users = []
         //loop through the users array
         data.forEach( item => {
            let name = item.publicId,
            //create the user and parse the fields
            user = model( name ).parse( item.fields )
            //add the user to the array
            users.push( user )
         })
         return users
      } else {
         return null
      }
   }
}

module.exports = _user

async function readFromCache( name ) {

}