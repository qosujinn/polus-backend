//node modules
let https = require('https'),
fs = require('fs')

//include modules
const CONF = require('./.config'),
expr = require('express')(),
controller = require('./controller'),
lib = require('./lib'),
helpr = require('./lib/helper')

//express middleware
expr.use( require('body-parser').json() ) 
expr.use( require('body-parser').urlencoded({ extended: true }) )
expr.use( require('cors')() )

const app = {
   //add necessary objects to the main app object
   expr: expr,

   /*
    * initialize 
    * starts up the server and any other initilization needed
    */
   initialize: () => {
      //get the key and certificate for SSL
      let options = {
         key: fs.readFileSync(`./src/lib/security/${CONF.env.key_name}`),
         cert: fs.readFileSync(`./src/lib/security/${CONF.env.cert_name}`)
      }
      //start the https server, passing the options and the express object
      https.createServer( options, expr ).listen( CONF.env.port_https, () => {
         console.log( `server's running on port ${ CONF.env.port_https }` )
      })
   }
}

module.exports = app