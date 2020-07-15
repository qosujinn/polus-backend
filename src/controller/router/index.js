module.exports = {
   routes: {},

   addRoute( service, handles ){
      try {
         this.routes[service] = handles
      } catch(e) {
         console.log('there was an error: ', e)   
      }
   },

   run( options, data ) {
      try {
         return this.routes[options.service][options.method][options.route]( data )
      } catch(e) {
         console.log('there was an error ', e)
      }
   }
}