const ENV = require('../../.helper').CONF.env

let { request } = require('../../.helper')
let model = require('../../.models').task

const _task = {
   async get( id ) {
      console.log('[task.js] hit')
      //create a request for the task info from cherwell
      let get = request('json'),
      result = await get(`${ENV.domain}/s/cherwell/task/${id}`)
      
      if( result.statusCode !== 200 ) { return null }
      else {
         //create a ticket, then parse the cherwell data and add it
         let task = model( result.data.busObPublicId )
         .parse( 'cherwell', result.data )
         
         return task

      }
   },

   async update() {

   }
}

module.exports = _task
