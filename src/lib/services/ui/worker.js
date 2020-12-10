let dashboard = require('./lib/dashboard'),
ticket = require('./lib/ticket'),
task = require('./lib/task'),
form = require('./lib/form'),
catalog = require('./lib/catalog'),
user = require('./lib/user')

let { request } = require('../../.helper'),
logger = require('../../.helper').logger(),
ENV = require('../../.helper').CONF.env

module.exports = () => ({
   dashboard: dashboard,
   ticket: ticket,
   task: task,
   form: form,
   catalog: catalog,
   user: user,

   async init() {
      
      return true      
   },
   
   async getTenants() {
      try {
         let get = request( 'json', 200 ),
         result = await get( `${ENV.domain}/s/cherwell/object/tenant` )
         if( result ) {
            //loop through objects
            let tenants = []
            result.forEach( tenant => {
               tenant.fields.forEach( field => {
                  if( field.name == 'Tenant' && field.value != "" ) {
                     tenants.push( field.value )
                  }
               })
            })
            return tenants
         } else {
            return null
         }
      } catch( e ) {
         console.log( e )
         return null
      }
   }
   
})


