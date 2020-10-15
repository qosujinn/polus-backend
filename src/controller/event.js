let handler = {
   'events': {},

   add: function( service, handlers ) {
      if( service in this.events ) {
         throw new Error(`don't know how but this exists already!`)
      }

      this.events[service] = handlers
      console.log(`-->> events for ${service.green} added to event controller`)
      return this

   }
}

let controller = {
   post: async function( req, res ) {
      console.log( req.url )
      res.status(200).end()
      // return handler.commands[req.params.service][req.params.command]
   }
}

module.exports = { handler, controller }