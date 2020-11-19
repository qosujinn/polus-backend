/**
 * handler for the Cherwell module
 * @module cherwell/handler
 * @requires module:cherwell/object
 */

/**
 * handles for the Cherwell service 
 * @param {object} worker - passed in from initialization. Handles library methods and token requests
 */
module.exports = ( worker ) => ({
   routes: {
      /**
       * /:object 
       */
      '/object/:name': {
         /**
          * @function get
          * GET method for the /:object route
          * makes a search for the object passing the name parameter and the request body.
          * 
          * @param req - the request object
          * @param res - the response object
          */
         get: async ( req, res ) => {
            let name = req.params.name.toLowerCase(),
            result = await worker.object.search( name, req.body )
            if( !result ) res.status(500).send()
            else {
               let objects = result['businessObjects']
               res.status(200).send( objects )
            }
         },
   
         /**
          * @function post
          * POST method for the /:object route
          * creates an object.
          * 
          * @param req - the request object
          * @param res - the response object
          */
         post: async ( req, res ) => {
            let name = req.params.name.toLowerCase(),
            success = await worker.object.create( name, res.body )
            if( !success ) res.status(500).send()
            else res.status(200).send()
            
         }
      },
      
      /**
       * /:object/:id
       */
      '/object/:name/publicId/:id': {
         /**
          * @function get
          * GET method for the /object/:name/:id route
          * gets an object by its name and ID
          * 
          * @param req - the request object
          * @param res - the response object
          */
         get: async ( req, res ) => {
            console.log('hit')
            let id = req.params.id,
            name = req.params.name.toLowerCase()
   
            worker.object.get( id, name ).then( data => {
               res.status(200).send( data )
            }).catch( () => {
               res.status(404).send()
            })
         },
   
         /**
          * @function post
          * POST method for the /:object/:id route
          * updates an object.
          * 
          * @param req - the request object
          * @param res - the response object
          */
         post: async ( req, res ) => {
            let result = await worker.object.update( res.body )
            res.status(200).send()
         } 
      },
   
      /**
       * /:object/recId/:recId
       */
      '/object/:name/recId/:recId': {
         /**
          * @function get
          * GET method for the /object/:name/recId/:recId route
          * gets an object by its name and record ID
          * 
          * @param req - the request object
          * @param res - the response object
          */
         get: async( req, res ) => {
            let recId = req.params.recId,
            name = req.params.name
   
            let data = await worker.object.getByRecId( recId, name )
            if( !data ) { res.status(200).send() }
            else {
               res.status(200).send(data)
            }         
         }
      },
   
      /**
       * /:object/recId/:recId/email
       */
      '/object/:name/recId/:recId/email': {
         /**
          * @function get
          * GET method for the /:object/:recId/email route
          * gets the latest email for a record
          * 
          * @param req - the request object
          * @param res - the response object
          */
         get: async ( req, res ) => {
            let recId = req.params.recId,
            name = req.params.name.toLowerCase()
            
            let email = await worker.object.getLatestEmail( recId, name )
            if( !email ) {
               res.status(404).send({ statusCode: 404 })
            } else {
               res.status(200).send( { statusCode: 200, email:  email })
            }
         }
      },
   
      /**
       * /:object/recId/:recId/related/relation
       */
      '/object/:name/recId/:recId/related/:relation': {
         /**
          * @function get
          * GET method for the /:object/:recId/:related/:relation route
          * gets an object's related business objects
          * 
          * @param req - the request object
          * @param res - the response object
          */
         get:  async ( req, res ) => {  
            let recId = req.params.recId,
            name = req.params.name.toLowerCase(),
            relation = req.params.relation
   
            worker.object.getRelated( recId, name, { displayName: relation } )
            .then( objs => {
               res.status(200).send(objs)
            }).catch( e => {
               console.log(e)
               res.status(200).send()
            })
         }
      },

      /**
       * /search
       */
      '/search': { 
         /**
          * @function get
          * GET method for the /search route
          * executes a business object search
          * 
          * @param req - the request object
          * @param res - the response object
          */
         get: async ( req, res ) => {
            try {
               let body = req.body
         
               let result = await worker.search.getSearchResults( body )
               if( result ) {
                  console.log('result success')
                  res.status(200).send( result )         
               } else {
                  console.log('result false ')
                  res.status(404).send( 'no results for the search' )
               }
            } catch( e ) {
               res.status(500).send( 'there was an error on the server' )
            }
         }
      },

      '/users': {
         get: async( req, res ) => {
            let team = req.query.team
            let result = await worker.user.getUsers( team )
            if( result ) {
               res.status(200).send( result )
            } else {
               res.status(404).send('team not found')
            }
         }
      },

      '/users/:id': {
         get: async( req, res ) => {
            // let id = req.query.id,
            // result = await worker.user.get( id )
            // if( result )
            res.status(200).send( req.params.id )
         }
      },
   },
   
   /**
    * EVENTS
    */
   events: {
   
      '/ping': async ( req, res ) => {
         res.status(200).send('ping ping')
      }
   }
   
})