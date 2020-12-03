let { request, urlencode } = require('../../../.helper'),
CONFIG = require('../../../.helper').CONF.cherwell,
req_options = request.OPTS

req_options.setURL( CONFIG.baseurl )
let logger = require('../../../.helper').logger()

module.exports = {
   
   async get( tenant ) {
      let teams = await getAllTeams()
      if( teams ) {
         //filter teams by the tenant
         let filtered = []
         teams.forEach( team => {
            if( team.teamName.indexOf( tenant ) > -1 ) {
               //add them to the list
               filtered.push( team )
            }
         })
         //send list back
         return filtered
      } else {
         return null
      }
   }
}

async function getAllTeams() {
   //create headers
   req_options.setHeaders( {
      'api-key': CONFIG.client_id,
      'Authorization': `Bearer ${CONFIG.token.access}`
   })
   //create request to cherwell service for teams
   let get =  request( req_options.url, req_options.headers, 'json', 200),
   result = await get( '/api/V2/getteams' )
   //if there's a result, get the teams array
   if( result ) {
      //send back the list of teams
      return result['teams']
   } else {
      return null
   }
}