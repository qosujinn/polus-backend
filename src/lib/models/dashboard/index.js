const { glob, path, colors } = require('../../../.helper'),
boards = {}

let _dashboard = ( boards ) => ({
   boards,

   get( name ) {
      if( this.boards[name] ) {
         return this.boards[name] 
      }
      
      return null
   }
})

module.exports = () =>  {
   console.log('\n[boot/lib/models] gathering dashboard schemas..')
   let files = glob.sync('./src/lib/models/dashboard/schemas/**.js')
   while( files.length != 0 ) {
      let file = files.pop()
      let { name, schema } = require( path.resolve(file) )
      if( name && schema ) {
         boards[name] = schema
         console.log(`[boot/lib/models] ${name.green} schema loaded`)
      }
   }

   return _dashboard( boards )
}