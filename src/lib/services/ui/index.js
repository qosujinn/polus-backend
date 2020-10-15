/**
 * entry point for the UI service
 * Services export an asynchronous init function, which will run at boot. init functions return an object with a name and handler object.
 * @module ui
 * @requires module:ui/handler
 */

const name = 'ui'

module.exports = async function() {
   handler = require('./handler')
   console.log(`[lib/services/ui] ${name} service initialized`.green)
   return { name, handler }
}