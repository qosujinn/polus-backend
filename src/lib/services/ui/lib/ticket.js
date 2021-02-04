const object = require('../../cherwell/lib/object')

const ENV = require('../../../.helper').CONF.env

let { request } = require('../../../.helper'),
model = require('../../.models').ticket

const TYPE = [ 'incident', 'hrcase' ]

const _ticket = {
   async get( id ) {
      try{
         console.log('[ticket.js] hit')
         //create a request for the ticket info from cherwell
         let get = request('json', 200)
         
         //check for the ticket by trying each type
         for( let i = 0; i <= TYPE.length - 1; i++ ) {
            let result = await get(`${ENV.domain}/s/cherwell/object/${TYPE[i]}/publicId/${id}`)
            
            if( result ) {
               //create a ticket, then parse the cherwell data and add it
               let ticket = model( result.busObPublicId )
               .parse( 'cherwell', result )
               console.log( ticket )
               //set the type of ticket
               ticket.set( { type: TYPE[i] })
               //get the latest email for the ticket
               try{
                  result = await get(`${ENV.domain}/s/cherwell/object/${TYPE[i]}/recId/${ticket.recId}/email`)
                  if( result ) { 
                     //get the Details field from the result
                     let details
                     result.fields.forEach( field => {
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
               } catch( e ) {
                  if( e.statusCode == 404 ) {
                     console.log( 'no emails' )
                  }
               }
               //get the subscibers for the ticket
               try {
                  result = await get( `${ENV.domain}/s/cherwell/object/${TYPE[i]}/recId/${ticket.recId}/subscribers` )
                  if( result ) {
                     let subscribers = []
                     //loop through, get emails
                     result.forEach( sub => {
                        console.log( sub )
                        let obj = {
                           name: '',
                           email: ''
                        }
                        sub.fields.forEach( field => {
                           if( field.name == 'SubscriberEmail' ) {
                              obj.email = field.value
                           }
                           if( field.name == 'CustomerName' ) {
                              obj.name = field.value
                           }
                        })

                        subscribers.push( obj )
                        console.log( subscribers )
                     })
                     //set to ticket
                     ticket.set( { subscribers: subscribers } )
                  }
               } catch( e ) {
                  if( e.statusCode == 404 ) { 
                     console.log( 'no subscribers found' )
                  }
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
      if( data.subscribers ) {
         let result = await createSubscribers( data )
         if( !result ) {
            return false
         }
      }
      let obj = createCherwellData( data )
      let post = request( 'json', 'POST', 200 )
      let success = await post( `${ENV.domain}/s/cherwell/object/incident`, obj )
      if( success ) {
         console.log( success )
         return true
      } else {
         return false
      }

   },

   async update( data ) { 
      console.log('update hit')
      console.log( data )
      if( data.subscribers ) {
      let result = await createSubscribers( data )
      if( !result ) {
         return false
      }
   }
      let obj = createCherwellData( data )
      let put = request( 'json', 'PUT', 200, 500, 404 )
      try{
         let result = await put( `${ENV.domain}/s/cherwell/object/incident`, obj )
         if( result.err ) {
            console.log( result )
            return result
         } else {
            return true
         }
      } catch( e ) {
         console.log( e )
         return e
      }

   }
}

module.exports = _ticket

async function createSubscribers( data ) {
   console.log( 'creating subscribers...' )
   //get the object schema and the subscriber summary and template
   let get = request( 'json', 200 )
   let schema = await get( `${ENV.domain}/s/cherwell/object/schema/${data.type}` ),
   summary = await get( `${ENV.domain}/s/cherwell/object/summary/subscriber` ),
   template = await get( `${ENV.domain}/s/cherwell/object/template/subscriber` )

   if( schema && summary && template ) {

      let subs = []
    
      //get the busObId and relationship ID
      let objId = summary.busObId
      console.log( objId )
      let relation = schema['relationships'].find( rel => rel['displayName'] == "Incident has Subscribers" ),
      relationshipId = relation['relationshipId']
      //create the subscriber objects
      data.subscribers.forEach( async sub => {
         if( sub.name == 'new' ) {
            let fields = template.fields
            fields.forEach( field => {
               switch( field.name ) {
                  case 'CustomerName':
                     field.dirty = true
                     field.value = 'CC'
                     break

                  case 'SubscriberEmail':
                     field.dirty = true
                     field.value = sub.email
                     break

                  case 'IncidentRecID':
                     field.value = data.recId
                     break

                  case 'IncidentID':
                     field.value = data.id
                     break

                  default:
                     break
               }
            })
            let obj = {
               busObId: objId,
               fields: fields,
               persist: true

            }

            
            try {
               let post = request( 'json', 'POST', 200),
               result = await post( `${ENV.domain}/s/cherwell/object/subscriber`, obj )
               // await post( `${ENV.domain}/s/cherwell/related/save`, obj )
               if( result ) {

                  console.log( 'subscribers saved')
                  console.log( result )
               } else {
                  console.log( 'subscribers not saved')
               }
            } catch( e ) {
               console.log( e )
            }
         }

      })
      return true
   } else {
      return null
   }
}

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
            value: data.description.html
         },
         {
            name: 'OwnedByTeam',
            value: data.team
         },
         {
            name: 'OwnedBy',
            value: data.owner.name
         },
         {
            name: 'OwnedByEmail',
            value: data.owner.email
         },
         {
            name: 'CustomerDisplayName',
            value: data.requestor.name
         },
         {
            name: 'CustomerEmail',
            value: data.requestor.email
         },
         {
            name: 'Priority',
            value: data.priority
         }
      ]
   }

   return cherwellData
}
