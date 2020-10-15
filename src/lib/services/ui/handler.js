let { request } = require('../.helper'),
ENV = require('../.helper').CONF.env

let dashboard = require('./lib/dashboard'),
ticket = require('./lib/ticket'),
task = require('./lib/task'),
form = require('./lib/form')

let routes =  {
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
            res.status(500).send(`something happened on the server; couldn't get the task :(`) 
           }
     }
   },

   '/dashboards/:name': {
      post: async ( req, res ) => {
         let data = await dashboard.get( req.params.name, req.body )
         if( data ) {
            res.status(200).send(data)
         } else {
            res.status(500).send(`something happened on the server; couldn't get the dashboard :(`)
         }
      }
   },

   '/forms/:tenant/:service/:category/:subcategory': {
      get: async ( req, res ) => {
         //search the catalogs for the subcategory
         let tenant = req.params.tenant,
         service = req.params.service,
         category = req.params.category,
         subcategory = req.params.subcategory;
         //get the form needed
         let data = await form.get( tenant, { service, category, subcategory } )
         //if there's a form, send it
         if( data ) {
            res.status(200).send(data);
         } else {
            //if not, it's likely an error. send the status and message back
            res.status(500).send(`something happened on the server; couldn't get the form :(`);
         }
      }
   },

   '/forms/submit': {
      post: async( req, res ) => {
         let data = req.body,
         result = await form.submit( data )
         if( result ) {
            res.status(200).send(true)
         } else {
            res.status(404).send(null)
         }
      }
   }
}

module.exports = { routes }