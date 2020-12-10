
module.exports = ( worker ) => ({ 
   routes:  {
      '/tickets/:id': {
         get: async ( req, res ) => {
            try {
               let data = await worker.ticket.get( req.params.id )
               if( data ) {
                  res.status(200).send(data)
               } else { 
                  res.status(404).send(`something happened on the server; couldn't get the ticket :(`) 
                  }
            } catch( e ) {
               console.log( e )
               res.status(500).send( 'there was an error on the server' )
            }
         }
      },
      
      '/tickets/save': {
         post: async ( req, res ) => {
            try {
               console.log('hit')
               let data = req.body,
               success = await worker.ticket.save( data )
               if( success ) {
                  res.status(200).send('ticket saved')
               } else {
                  res.status(400).send( 'ticket not saved' )
               }
            } catch( e ){
               console.log( e )
               res.status(500).send( 'there was an error on the server')
            }
         },

         put: async ( req, res ) => {
            try {
               console.log('put hit')
               let data = req.body,
               success = await worker.ticket.update( data )
               if( success ) {
                  res.status(200).send(true)
               } else {
                  res.status(400).send( false )
               }
            } catch( e ){
               console.log( e )
               res.status(500).send( 'there was an error on the server')
            }
         }
      },

      '/tasks/:id': {
         get: async ( req, res ) => {
            try {
               let data = await worker.task.get( req.params.id )
               if( data ) {
                  res.status(200).send(data)
               } else { 
                  res.status(404).send(`couldn't get the task`) 
               }
            } catch( e ) {
               console.log( e )
               res.status(500).send('there was an error on the server')
            }
         }
      },

      '/dashboards/:name': {
         post: async ( req, res ) => {
            try {
               let data = await worker.dashboard.get( req.params.name, req.body )
               if( data ) {
                  res.status(200).send(data)
               } else {
                  res.status(500).send(`something happened on the server; couldn't get the dashboard :(`)
               }
            } catch( e ) {
               console.log( e )
               res.status(500).send( 'there was an error on the server' )
            }
         }
      },

      '/forms/:tenant/:service/:category/:subcategory': {
         get: async ( req, res ) => {
            try{
               //search the catalogs for the subcategory
               let tenant = req.params.tenant,
               service = req.params.service,
               category = req.params.category,
               subcategory = req.params.subcategory;
               //get the form needed
               let data = await worker.form.get( tenant, { service, category, subcategory } )
               //if there's a form, send it
               if( data ) {
                  res.status(200).send(data);
               } else {
                  //if not, send a 404
                  res.status(404).send(`couldn't get the form`);
               }
            } catch( e ) {
               res.status(500).send( 'there was an error on the server' )
            }
         }
      },

      '/forms/submit': {
         post: async( req, res ) => {
            try {
               let data = req.body,
               result = await worker.form.submit( data )
               if( result ) {
                  res.status(200).send(true)
               } else {
                  res.status(404).send(null)
               }
            } catch( e ) {
               console.log( e )
               res.status(500).send( 'there was an error on the server' )
            }
         }
      },

      '/users': {
         get: async( req, res ) => {
            try {
               let team = req.query.team,
               result = await worker.user.getUsers( team )
               if( result ) {
                  res.status(200).send( result )
               } else res.status(404).send('users not found for given team')
            } catch( e ) {
               console.log( e )
               res.status(500).send( 'there was an error on the server' )
            }
         }
      },

      '/tenants': {
         get: async ( req, res ) => {
            try {
               let result = await worker.getTenants()
               if( result ) {
                  res.status(200).send( result )
               } else {
                  res.status(404).send( 'no tenants found' )
               }
            } catch( e ) {
               console.log( e )
               res.status(500).send( 'there was an error on the server' )
            }
         }
      },

      '/users/:name': {
         get: async( req, res ) => {
            try {
               let name = req.params.name,
               result = await worker.user.get( name )
               if( result ) {
                  console.log( result )
                  res.status(200).send( result )
               } else res.status(404).send('user not found')
            } catch( e ) {
               console.log( e )
               res.status(500).send('there was an error on the server' )
            }
         }
      },

      '/catalogs/:tenant/:type': {
         get: async( req, res ) => {
            try {
               let tenant = req.params.tenant.toUpperCase(),
               type = req.params.type.toLowerCase()

               let result = await worker.catalog.get( type, tenant )
               if( result ) {
                  res.status(200).send( result )
               } else {
                  res.status(404).send('catalog not found')
               }
            } catch( e ) {
               console.log( e )
               res.status(500).send('there was an error on the server' )
            }
         }
      }
   }
})
