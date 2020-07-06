const expr = require('express')(),
CONF = require('./src/.config'),
controller = require('./controller')

let https = require('https'),
fs = require('fs')

//express middleware
expr.use( require('body-parser').json() ) 
expr.use( require('body-parser').urlencoded({ extended: true }) )
expr.use( require('cors')() )



const app = {
   //add necessary objects to the main app object
   CONF: CONF,
   expr: expr,
   controller: controller,

   /*
    * initialize 
    * starts up the server and any other initilization needed
    */
   initialize: () => {
      //get the key and certificate for SSL
      let options = {
         key: fs.readFileSync(`./lib/security/${CONF.env.key_name}`),
         cert: fs.readFileSync(`./lib/security/${CONF.env.cert_name}`)
      }
      //start the https server, passing the options and the express object
      https.createServer( options, expr ).listen( CONF.env.port_https, () => {
         console.log( `server's running on port ${ CONF.env.port_https }` )
      })
   }
}