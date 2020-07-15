module.exports = {
   services: {},

   addService: ( name, handles ) => {
      try {
         this.services[name] = handles
      } catch(e) {
         console.error(e)
      }
   },

   get( service ) {
      return services[ service ]
   }
}