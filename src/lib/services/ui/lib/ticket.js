const { truncate } = require('lodash')

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
               //set the type of ticket
               ticket.set( { type: TYPE[i] })
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

   async save( data ) {
      let obj = createCherwellData( data )
      let post = request( 'json', 'POST', 200 )
      let success = await post( `${ENV.domain}/s/cherwell/object/${data.type}`, obj )
      if( success ) {
         return true
      } else {
         return false
      }

   },

   async update( data ) {
      let obj = createCherwellData( data )
      let put = request( 'json', 'PUT', 200 )
      let success = await put( `${ENV.domain}/s/cherwell/object/${data.type}`, obj )
      if( success ) {
         return true
      } else {
         return false
      }

   }
}

module.exports = _ticket

function createCherwellData( data ) {
   let cherwellData = {
      busObId: data.busObId,
      busObPublicId: data.id,
      busObRecId: data.recId,
      fields: [ 
         {
            name: 'Tenant',
            value: data.tenant,
         },
         {
            name: 'Service',
            value: data.classification.service
         },
         {
            name: 'Category',
            value: data.classification.category
         },
         {
            name: 'Subcategory',
            value: data.classification.subcategory
         },
         {
            name: 'Status',
            value: data.status
         },
         {
            name: 'Description',
            value: data.description.text,
            html: data.description.html
         },
         {
            name: 'OwnedByTeam',
            value: data.team
         },
         {
            name: 'OwnedBy',
            value: data.owner.name
         }
      ]
   }

   return cherwellData
}
