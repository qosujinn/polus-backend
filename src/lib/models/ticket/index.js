module.exports = ( id ) => ({
   id,
   
   set(obj) {
      try {
         let fields = Object.keys(obj)
         fields.forEach( field => {
            this[field] = obj[field]
         })
      } catch(e) {
         console.log(`[lib/models/ticket] set: there was an error\n${e}`)
      }
      return this
   },
   
   parse( service, data ) {
      try {
         switch( service ) {
            case 'cherwell':
               parseCherwell( data, this )
               break

            default:
               break
         }
      } catch(e) {
         console.log(`[lib/models/ticket] parse: there was an error\n${e}`)
      }
      return this
   }
})

function parseCherwell( data, ticket ) {
   
   let parsed = {
      recId: data.busObRecId,
      objId: data.busObId,
      owner: {},
      requestor: {},
      classification: {}
   }

   data.fields.forEach( field => {
      switch( field.name ) {
         case 'Tenant':
            parsed.tenant = field.value
            break
         
         case 'Description':
            parsed.description = {
               text: field.value,
               html: field.html
            }
            break

         case 'Service':
            parsed.classification.service = field.value
            break
            
         case 'Category':
            parsed.classification.category = field.value
            break
         
         case 'Subcategory':
            parsed.classification.subcategory = field.value
            break

         case 'CreatedDateTime':
            parsed.dated = field.value
            break

         case 'ShortDescription':
            parsed.subject = field.value
            break

         case 'CustomerDisplayName':
            parsed.requestor.name = field.value
            break

         case 'CustomerEmail':
            parsed.requestor.email = field.value
            break

         case 'OwnedByTeam':
            parsed.team = field.value
            break
      
         case 'OwnedBy':
            parsed.owner.name = field.value
            break

         case 'OwnedByEmail':
            parsed.owner.email = field.value
            break

         case 'Priority':
            parsed.priority = field.value
            break

         case 'Status':
            parsed.status = field.value
            break

         default:
            break
      }
   })

   ticket.set( parsed )
   return ticket
}