/**
 * Ticket model
 * a ticket contains information primarily from Cherwell. All primary identifying information, such as Ticket IDs or
 * customer info, originates there.
 * @module model/ticket
 */

/**
 * Exported factory method for the ticket model
 */
module.exports = ( id ) => ({
   /**
    * @member id
    * public ID of the ticket
    */
   id,
   
   /**
    * @function set
    * @summary sets new members to the ticket, in the key:value pair passed in the object
    * @param obj - object of keys and values
    * @return {this} the instance of the ticket
    */
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
   
   /**
    * @function parse
    * @summary parses the data by service
    * @param service - the name of the service
    * @param data - the data to be parsed
    * @return {this} the instance of the ticket
    */
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

/**
 * UTILITY FUNCTIONS
 */

/**
 * @function parseCherwell
 * @summary parses the Cherwell data, then sets it to the ticket
 * @param data - the data to be parsed
 * @param ticket - the instance of the ticket 
 */
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