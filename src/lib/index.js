const { glob, path } = require('../.helper')

module.exports = {
   services: glob.sync('./src/lib/services/**/index.js', ( er, files ) => {
      let lib, services = []
      console.log(files)
      if( files ) {
         files.forEach(( file ) => {
            lib = require( path.resolve(file) )()
            if( !lib ) { console.error( `service ${name} did not initialize`) }
            services.push( { name: file, lib: require( path.resolve(file) ) } )
         })
      }
      return services
   }),

   events: glob.sync('./src/lib/services/**/lib/events/index.js', ( er, files ) => {
      let events = []
      if( files ) {
         files.forEach(( file ) => {
            events.push( { name: file, lib: require( path.resolve(file) ) } )
         })
      }
      return events
   })
}