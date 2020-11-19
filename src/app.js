

const { fs, path } = require('./helper'),
ENV = require('./helper').CONF.env,
https = require('https'),
http = require('http')

const router = require('./router'),
      controller = require('./controller'),
      lib = require('./lib'),
      logger = require('./helper').logger(),
      worker = require('./worker')
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
       //rotate log files
      logger.rotate().then( async () => {
         //initialize services
         let services = await lib()
         logger.log( 'boot', '[boot/controller] initializing controllers...')
         controller( router, services ).then( () => {
            logger.log( 'boot', '[boot/controller] controllers initialized')
            //start the https server, passing the options and the express object
            https.createServer( options, router ).listen( ENV.port_https, () => {
               console.log(`[boot] https server's running on port ${ ENV.port_https }`)
               logger.log( 'boot', `[boot] https server successfully started; running on port ${ ENV.port_https }` )
            })
            //if running locally, start up the http server
            if( process.env.NODE_ENV == 'localdev' ) {
               http.createServer( router ).listen( ENV.port_http , () => {
                  console.log(`[boot] http server's running on port ${ ENV.port_http }`)
                  logger.log( 'boot', `[boot] http server successfully started; running on port ${ ENV.port_http }` )
               })
            }
            //after the servers are running, initialize the worker
            worker.init()

         })
      })
   }
}

module.exports = app
