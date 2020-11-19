let logger = require('../helper').logger(),
 service = require('./service'),
event = require('./event'),
command = require('./command')

module.exports = ( router, lib ) => {
   return new Promise( (rsl, rej) => {
      //get the list of services
      let services = Object.keys(lib)
      //loop through the list and add them to the controllers
      services.forEach( name => {
         //since routes tend to have multiple methods we're doing some more looping
         let handles = lib[name]['routes']
      
         if( handles ) {
            //so add the route handles...
            service.handler.add( name, handles )
            //...get the route off the handles..
            let routes = Object.keys( handles )
            //loop it
            routes.forEach( route => {
               
               //get all the methods for the route
               let methods = Object.keys( handles[route] )
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