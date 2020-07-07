const expr = require('../../app').expr,
CONF = require('../../.config')

let { Shibboleth } = require('shibboleth'),
shibb = new Shibboleth( CONF.shibboleth.url )

module.exports = {

   routes: {
      get: {},
      post: {},
   },

   add: ( service, method, handles ) => {

   },

   init: () => {
      expr.get('/')
   }
}