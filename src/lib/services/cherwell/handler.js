/**
 * handler for the Cherwell module
 * @module cherwell/handler
 * @requires module:cherwell/object
 */

const object = require('./lib/object')

/**
 * ROUTES
 */
let routes = {
   /**
    * /:object 
    */
   '/:object': {
      /**
       * @function get
       * GET method for the /:object route
       * makes a search for the object passing the name parameter and the request body.
       * 
       * @param req - the request object
       * @param res - the response object
       */
      get: async ( req, res ) => {
         let name = req.params.object.toLowerCase(),
         result = await object.search( name, req.body )
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
         let name = req.params.object.toLowerCase(),
         success = await object.create( name, res.body )
         if( !success ) res.status(500).send()
         else res.status(200).send()
         
      }
   },
   
   /**
    * /:object/:id
    */
   '/:object/:id': {
      /**
       * @function get
       * GET method for the /:object/:id route
       * gets an object by its name and ID
       * 
       * @param req - the request object
       * @param res - the response object
       */
      get: async ( req, res ) => {
         console.log('[cherwell/handler] hit')
         let id = req.params.id,
         name = req.params.object.toLowerCase()

         let data = await object.get( id, name )
            if ( data ) {
               res.status(200).send({ statusCode: 200, data: data })
            } else {
               res.status(404).send({ statusCode: 404 })
            }
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
         let result = await object.update( res.body )
         res.status(200).send()
      } 
   },

   /**
    * /:object/recId/:recId
    */
   '/:object/recId/:recId': {
      /**
       * @function get
       * GET method for the /:object/recId/:recId route
       * gets an object by its name and record ID
       * 
       * @param req - the request object
       * @param res - the response object
       */
      get: async( req, res ) => {
         let recId = req.params.recId,
         name = req.params.object

         let data = await object.getByRecId( recId, name )
         if( !data ) { res.status(200).send() }
         else {
            res.status(200).send(data)
         }         
      }
   },

   /**
    * /:object/recId/email
    */
   '/:object/:recId/email': {
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
         name = req.params.object.toLowerCase()
         
         let email = await object.getLatestEmail( recId, name )
         if( !email ) {
            console.log('no email')
            res.status(404).send({ statusCode: 404 })
         } else {
            res.status(200).send( { statusCode: 200, email:  email })
         }
      }
   },

   /**
    * /:object/:recId/related/relation
    */
   '/:object/:recId/related/:relation': {
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
         name = req.params.object.toLowerCase(),
         relation = req.params.relation

         object.getRelated( recId, name, { displayName: relation } )
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
         console.log(req.body)
         res.status(200).send()
      }
   }
}

/**
 * EVENTS
 */
let events = {

   '/ping': async ( req, res ) => {
      console.log(req.body)
      res.status(200).send()
   }
}

/**
 * COMMANDS
 */
let commands = {}

module.exports = { routes, events, commands }