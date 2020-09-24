const object = require('./lib/object')

let routes = {
   '/:object': {
      get: async ( req, res ) => {
         
         let result = await object.search( req.params.object, req.body )
         if( !result ) res.status(200).send()
         else {
            let objects = result['businessObjects']
            res.status(200).send( objects )
         }
      },

      post: async ( req, res ) => {
         let result = await object.create( name, res.body )
         if( !success ) res.status(200).send()
         else res.status(200).send()
         
      }
   },
      
   '/:object/:id': { 
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

      post: async ( req, res ) => {
         let result = object.update( res.body )
         res.status(200).send()
      } 
   },

   '/:object/recId/:recId': {
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

   '/:object/:recId/email': {
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

   '/:object/:recId/related/:relation': {
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

   '/search': { 
      get: async ( req, res ) => {
         console.log(req.body)
         res.status(200).send()
      }
   }
}

let events = {
   '/ping': async ( req, res ) => {
      console.log(req.body)
      res.status(200).send()
   }
}

let commands = {}

module.exports = { routes, events, commands }