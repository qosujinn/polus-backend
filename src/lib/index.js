const { glob, path, colors } = require('../.helper')

module.exports = async function() {

   let obj = {}

   console.log('\n[boot/lib] initializing libraries...')
   let files = glob.sync('./src/lib/services/**/index.js')
   while( files.length != 0 ) {
      let file = files.pop()
      let service = require( path.resolve(file) )
      if( service ) {
         //initialize the service to get its name and handler 
         let lib = await service()
         if( lib ) {
            obj[lib.name] = lib.handler
         }
      }
   }
   return obj
}