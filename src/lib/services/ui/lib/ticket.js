const ENV = require('../../../.helper').CONF.env

let { request } = require('../../../.helper'),
model = require('../../.models').ticket

const TYPE = [ 'incident', 'hrcase' ]

const _ticket = {
   async get( id ) {
      try{
         console.log('[ticket.js] hit')
         //create a request for the ticket info from cherwell
         let get = request('json', 200, 404)
         
         //check for the ticket by trying each type
         for( let i = 0; i <= TYPE.length - 1; i++ ) {
            let result = await get(`${ENV.domain}/s/cherwell/object/${TYPE[i]}/publicId/${id}`)
            console.log( result )
            if( result ) {
               //create a ticket, then parse the cherwell data and add it
               let ticket = model( result.busObPublicId )
               .parse( 'cherwell', result )
               //get the latest email for the ticket
               result = await get(`${ENV.domain}/s/cherwell/object/${TYPE[i]}/recId/${ticket.recId}/email`)
               if( result.statusCode == 200 ) { 
                  //get the Details field from the result
                  let details
                  result['email'].fields.forEach( field => {
                     if( field.name == "Details" ) { details = field }
                  })
                  
                  //put them in the email object
                  let email = {
                     text: details.value,
                     html: details.html
                  }
                  //set the ticket's email object
                  ticket.set( { email: email } )
               }
               //return when done
               console.log('done')
               return ticket
      
            }
         }

         //if it got here, nothing was found
         return null
      } catch( e ) {
         console.log( e )
         return null
      }
   },

   async update() {

   }
}

module.exports = _ticket
