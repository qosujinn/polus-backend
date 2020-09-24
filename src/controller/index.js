let service = require('./service'),
event = require('./event'),
command = require('./command')

module.exports = ( router, lib ) => {
   return new Promise( (rsl, rej) => {
      console.log('\n[boot/controller] creating controllers...')
      //get the list of services
      let services = Object.keys(lib)
      //loop through the list and add them to the controllers
      services.forEach( name => {
         //since routes tend to have multiple methods we're doing some more looping
         let handlers = lib[name]['routes']
      
         if( handlers ) {
            //so add the route handlers...
            service.handler.add( name, handlers )
            //...get the routes off the handlers..
            let routes = Object.keys( handlers )
            //loop it
            routes.forEach( route => {
               
               //get all the methods for the route
               let methods = Object.keys( handlers[route] )
               //loop it
               methods.forEach( method => {
                  //add the route to the router's method function with the controller method function
                  router[method](`/s/${name}${route}`, service.controller[method]( name, route ) )
               })
            })
         }
         
         if( lib[name]['events']) {
            event.handler.add( name, lib[name]['events'] )
            router.post(`/e/:service/:event`, event.controller.post )
         }

         if( lib[name]['commands'] ) {
            command.handler.add( name, lib[name]['commands'] )
            router.post(`/c/:service/:command`, command.controller.post )
         }
      })

      rsl()
   })
}