

const { fs, path, log } = require('./.helper'),
ENV = require('./.helper').CONF.env,
https = require('https'),
http = require('http')

const router = require('./router'),
      controller = require('./controller'),
      lib = require('./lib'),
      logger = log()
//get the key and certificate for SSL
let options = {
   key: fs.readFileSync(ENV.key),
   cert: fs.readFileSync(ENV.cert)
}

const app = {
   /*
    * initialize 
    * starts up the server and any other initilization needed
    */
   initialize: async () => {
      let services = await lib()

      controller( router, services ).then( () => {
         
         //start the https server, passing the options and the express object
         https.createServer( options, router ).listen( ENV.port_https, () => {
            console.log(`\nhttps server's running on port ${ ENV.port_https }`)
            logger.append( 'boot', `[boot] https server successfully started; running on port ${ ENV.port_https }` )
         })
         //if running locally, start up the http server
         if( process.env.NODE_ENV == 'localdev' ) {
            http.createServer( router ).listen( ENV.port_http , () => {
               console.log(`http server's running on port ${ ENV.port_http }`)
               logger.append( 'boot', `[boot] http server successfully started; running on port ${ ENV.port_http }` )
            })
         }

      })
   }
}

module.exports = app