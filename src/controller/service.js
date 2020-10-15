let handler = {
   'services': {},

   'add': function( service, handlers ) {
      if( service in this.services ) {
         throw new Error(`[controller/service.handler.add] don't know how but this exists already!`)
      }
     
      this.services[service] = handlers
      console.log(`-->> ${service.green} added to service controller`)
      return this

   }
}

let controller = {
   'get': function( service, route ) {
      let func = handler.services[service][route].get
      return func
   },

   'post': function( service, route ) {
      let func = handler.services[service][route].post
      return func
   },

   'put': function( service, route ) {
      let func = handler.services[service][route].put
      return func
   },

   'delete': function( service, route ) {
      let func = handler.services[service][route].delete
      return func
   },
}

module.exports = { handler, controller }