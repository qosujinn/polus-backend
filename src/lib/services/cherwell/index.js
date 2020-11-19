/**
 * entry point for the Cherwell service
 * Services export an asynchronous init function, which will run at boot. init functions return an object with a name and handler object.
 * @module cherwell
 * @requires module:helper.request
 * @requires module:helper.urlencode
 * @requires module:helper.colors
 */

const name = 'cherwell'

const logger = require('../../.helper').logger(),
handler = require('./handler'),
worker = require('./worker')

/**
 * initializes the Cherwell service. Requests a token and will fail initialization if unsuccessful
 * @return {boolean} an object with the service name and handler object
 */
module.exports = async function() {
   try {
      logger.log('boot', `[boot/service/cherwell] initializing cherwell service...`)
      console.log(`[boot/service/cherwell] initializing cherwell service...`)
      //initialize the worker
      let success = await worker.init()
      if( success ) {
            //get the handles
         let handles = handler( worker )
         //return the name and the handles
         logger.log('boot', `[boot/service/cherwell] cherwell service initialized`)
         console.log(`[boot/service/cherwell] cherwell service initialized`)
         return { name, handles }
      } else {
         console.log('[boot/service/cherwell] error starting cherwell service')
         return null
      }
   } catch( e ) {
      console.log( e )
      return null
   }
}
