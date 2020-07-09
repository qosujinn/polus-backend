
const { Shibboleth } = require('shibboleth'),
CONF = require('../../lib/.config'),
shibb = new Shibboleth( CONF.shibboleth.url )

module.exports = ( expr ) => {
   //root
   expr.get( '/', ( req, res ) => {
      	console.log('request received at root') 
	res.send(`Hello there!`)
   })

   //ping
   expr.get( '/ping', ( req, res ) => {
     console.log('got pinged')
	 res.status(200).end('PINGING IT')
   })

   expr.get( '/auth', ( req, res ) => {
      console.log(`req url: ${req.url}`)
      if( shibb.shouldRedirect(req) ) {
         shibb.redirect( req, res )
      } else {
         res.status(200).end("good to go!")
      }
   })

   //if there ever is an error
   expr.use( ( err, req, res, next ) => {
      console.error( err.stack || err.message )
      res.send( 500, `server error: ${ err.message }`)
   })

}
