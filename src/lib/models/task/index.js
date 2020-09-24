module.exports = ( id ) => ({
   id,
   
   set(obj) {
      try {
         let fields = Object.keys(obj)
         fields.forEach( field => {
            this[field] = obj[field]
         })
      } catch(e) {
         console.log(`[lib/models/task] set: there was an error\n${e}`)
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
         console.log(`[lib/models/task] parse: there was an error\n${e}`)
      }
      return this
   }
})

function parseCherwell( data, task ) {
   
   let parsed = {
      recId: data.busObRecId,
      objId: data.busObId,
      owner: {},
      creator: {}
   }
    console.log(data)
    console.log( data.fields )
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

         case 'CreatedDateTime':
            parsed.dated = field.value
            break

         case 'Title':
            parsed.title = field.value
            break

         case 'CreatedBy':
            parsed.creator.name = field.value
            break

         case 'CreatedByEmail':
            parsed.creator.email = field.value
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

         case 'Status':
            parsed.staus = field.value
            break

         default:
            break
      }
   })

   task.set( parsed )
   return task
}