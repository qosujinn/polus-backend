let { request, urlencode } = require('../../../.helper'),
CONFIG = require('../../../.helper').CONF.cherwell,
req_options = request.OPTS

req_options.setURL( CONFIG.baseurl )
let logger = require('../../../.helper').logger()

module.exports = {
   async get( id ) {

   },

   async getUsers( team ) {
      try {
         req_options.setHeaders( {
            'api-key': CONFIG.client_id,
            'Authorization': `Bearer ${CONFIG.token.access}`
         })
         
         //create request to cherwell
         let get = request( req_options.url, req_options.headers, 'json'),
         result = await get('/api/V1/getlistofusers?loginidfilter=Windows')
         if( result ) {
            let users = []
            //get the users of the passed in team
            result.users.forEach( user => {
               user.fields.forEach( field => {
                  if( field.name === 'DefaultTeamName' && field.value === team ) {
                     users.push( user )
                  }
               })
            })
            return users
         }
      } catch( e ) {

      }
   }
}