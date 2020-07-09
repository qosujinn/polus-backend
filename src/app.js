
const expr = require('express')(),
CONFIG = require('./.helper').CONF.cherwell,
ENV = require('./.helper').CONF.env,
helpr = require('./.helper')

let Cherwell = require('./old/util/cherwell')

expr.use( require('body-parser').json() );
expr.use( require('cors')() );

const cherwell = new Cherwell({
	user: CONFIG.user,
	password: CONFIG.password,
	client_id: CONFIG.client_id,
	base_url: CONFIG.baseurl,
	tenant: CONFIG.tenant
});

//include modules
const https = require('https')
// controller = require('./controller'),
// helpr = require('./.helper')

const app = {
   /*
    * initialize 
    * starts up the server and any other initilization needed
    */
   initialize: () => {
      //get the key and certificate for SSL
      let options = {
         key: helpr.fs.readFileSync(ENV.key),
         cert: helpr.fs.readFileSync(ENV.cert)
      }
      // //initialize the controller
      // controller.init()
      require('./old/router')( expr )
      //start the https server, passing the options and the express object
      https.createServer( options, expr ).listen( helpr.CONF.env.port_https, () => {
         console.log( `server's running on port ${ helpr.CONF.env.port_https }` )
      })
   }
}

module.exports = app