let handler = {
   'commands': {},

   add: function( service, handlers ) {
      if( service in this.commands ) {
         throw new Error(`don't know how but this exists already!`)
      }

      this.commands[service] = handlers
      console.log(`-->> commands for ${service.green} added to command controller`)
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