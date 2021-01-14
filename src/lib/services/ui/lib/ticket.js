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
            console.log( result )
            if( result ) {
               //create a ticket, then parse the cherwell data and add it
               let ticket = model( result.busObPublicId )
               .parse( 'cherwell', result )
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
      let success = await post( `${ENV.domain}/s/cherwell/object/${data.type}`, obj )
      if( success ) {
         return true
      } else {
         return false
      }

   },

   async update( data ) { 
      
      if( data.subscribers ) {
      let result = await createSubscribers( data )
      if( !result ) {
         return false
      }
   }
      let obj = createCherwellData( data )
      let put = request( 'json', 'PUT', 200 )
      try{
         let success = await put( `${ENV.domain}/s/cherwell/object/${data.type}`, obj )
         if( success ) {
            return success
         } else {
            return false
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
      //get the display name for the relationship
      let displayName
      switch( data.type ) {
         case 'incident':
            displayName = 'Incident has Subscribers'
            break
         
         case 'hrcase':
            displayName = 'HR Case has Subscribers'
            break
      }
      //get the busObId and relationship ID
      let objId = summary.busObId
      let relation = schema['relationships'].find( rel => rel['displayName'] == displayName ),
      relationshipId = relation['relationshipId']
      //create the subscriber objects
      data.subscribers.forEach( sub => {
         if( sub.name == 'new' ) {
            let fields = template.fields
            fields.forEach( field => {
               if( field.name == 'CustomerName' ) {
                  field.dirty = true
                  field.value = 'CC'
               }

               if( field.name == 'SubscriberEmail' ) {
                  console.log( sub.email )
                  field.dirty = true
                  field.value = sub.email
               }
            })
            let obj = {
               parentBusObId: data.busObId,
               parentBusObPublicId: data.id,
               parentBusObRecId: data.recId,
               relationshipId: relationshipId,
               busObId: objId,
               fields: fields,
               persist: true

            }
            subs.push( obj ) 
         }
      })
      console.log( subs )
      //make the batch save request
      let post = request( 'json', 'POST', 200),
      result = await post( `${ENV.domain}/s/cherwell/objectbatch`, subs )
      if( result ) {
         console.log( 'subscribers saved')
         return true
      } else {
         console.log( 'subscribers not saved')
         return false
      }
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
