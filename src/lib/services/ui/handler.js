let { request } = require('../.helper'),
ENV = require('../.helper').CONF.env

let dashboard = require('./lib/dashboard'),
ticket = require('./lib/ticket'),
task = require('./lib/task')

let routes = {
   '/tickets/:id': {
      get: async ( req, res ) => {
          let data = await ticket.get( req.params.id )
          if( data ) {
             res.status(200).send(data)
          } else { 
             res.status(500).send(`something happened on the server; couldn't get the ticket :(`) 
            }
      }
   },

   '/tasks/:id': {
      get: async ( req, res ) => {
         let data = await task.get( req.params.id )
         if( data ) {
            res.status(200).send(data)
         } else { 
            res.status(500).send(`something happened on the server; couldn't get the ticket :(`) 
           }
     }
   },

   '/dashboards/:name': {
      post: async ( req, res ) => {
         console.log( "[ui/handler] hit" )
         console.log( req.params.name )
         console.log( req.body )

         let data = await dashboard.get( req.params.name, req.body )
         if( data ) {
            console.log( data )
            res.status(200).send(data)
         } else {
            res.status(500).send(`something happened on the server; couldn't get the dashboard :(`)
         }
      }
   }
}

module.exports = { routes }