const expr = require('express')(),
CONF = require('../.config'),
lib = require('../lib')

let { Shibboleth } = require('shibboleth'),
shibb = new Shibboleth( CONF.shibboleth.url )

//express middleware
expr.use( require('body-parser').json() ) 
expr.use( require('body-parser').urlencoded({ extended: true }) )
expr.use( require('cors')() )

let handler = require('./handler'),
router = require('./router')

module.exports = {
   handler: handler,
   router: router,
   expr: expr,

   addService( route, service, handles ) {
      //add service to the handler
      
   },

   init() {

      
   }
}