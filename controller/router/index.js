const shibb = new Shibboleth( CONF.shibboleth.url )

module.exports = ( expr ) => {
   //root
   expr.get( '/', ( req, res ) => {
      res.send(`Hello there!`)
   })

   //ping
   expr.get( '/ping', ( req, res ) => {
      res.status(200).end('PINGING IT')
   })

   expr.get( '/auth', ( req, res ) => {
      console.log(`req url: ${req.url}`)
      if( shibb.shouldRedirect(req) ) {
         shibb.redirect( req, res )
      } else {
         res.status(500).end("didn't work :(")
      }
   })

   //if there ever is an error
   expr.use( ( err, req, res, next ) => {
      console.error( err.stack || err.message )
      res.send( 500, `server error: ${ err.message }`)
   })

}