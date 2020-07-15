const handles = {
   get: {
      'ticket': function(data) {}
   },

   post: {
      'create/ticket': function( data ) {
         return new Promise( ( res, rej ) => {
            this.create( data ).then( () => {

            }).catch( (err) => {
               rej( err )
            })
         })  
      }
   }
}

module.exports = handles

