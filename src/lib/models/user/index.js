/**
 * Ticket model
 * a ticket contains information primarily from Cherwell. All primary identifying information, such as Ticket IDs or
 * customer info, originates there.
 * @module model/user
 */

/**
 * Exported factory method for the ticket model
 */
module.exports = ( name ) => ({
   /**
    * @member name
    * name of the user, which also serves as the public ID
    */
   name,

   
   /**
    * @function set
    * @summary sets new members to the user, in the key:value pair passed in the object
    * @param obj - object of keys and values
    * @return {this} the instance of the user
    */
   set(obj) {
      try {
         let fields = Object.keys(obj)
         fields.forEach( field => {
            this[field] = obj[field]
         })
      } catch(e) {
         console.log(`[lib/models/user] set: there was an error\n${e}`)
      }
      return this
   },

   parse( data ) {
      let parsed = {}
      data.forEach( field => {
         switch( field.name ) {
            case 'Title':
               parsed.title = field.value
               break
            
            case 'PersonalizedEmailAddress':
               parsed.email = field.value
               break

            case 'Phone':
               parsed.phone = field.value.slice(3) //remove the country code from the phone number
               break

            case 'DefaultTeamName':
               parsed.team = field.value
               break

            default:
               break
         }
      })

      this.set( parsed )
      return this
   }
})