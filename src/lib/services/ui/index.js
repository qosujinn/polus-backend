/**
 * entry point for the UI service
 * Services export an asynchronous init function, which will run at boot. init functions return an object with a name and handler object.
 * @module ui
 * @requires module:ui/handler
 */

const name = 'ui'

const logger = require('../../.helper').logger(),
handler = require('./handler'),
worker = require('./worker')()

module.exports = async function() {
   logger.log('boot', `[boot/services/ui] initializing ui service...`)
   worker.init()
   handles = handler( worker )
   logger.log( 'boot', `[boot/services/ui] ui service initialized`)
   return { name, handles }
}