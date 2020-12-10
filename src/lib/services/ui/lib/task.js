const ENV = require('../../../.helper').CONF.env

let { request } = require('../../../.helper')
let model = require('../../.models').task

const _task = {
   async get( id ) {
      console.log('[task.js] hit')
      //create a request for the task info from cherwell
      let get = request('json'),
      result = await get(`${ENV.domain}/s/cherwell/object/task/publicId/${id}`)
      console.log( 'task received' )
      console.log( result )
      if( result) {
         //create a ticket, then parse the cherwell data and add it
         let task = model( result.busObPublicId )
         .parse( 'cherwell', result )
         
         return task
      } else {
         return null
      }
   },

   async update() {

   }
}

module.exports = _task
