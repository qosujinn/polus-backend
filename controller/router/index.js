module.exports = ( expr ) => {
   //root
   expr.get('/', ( req, res ) => {
      res.send(`Hello there, ${ req.user.displayName }!`)
   })
   
   //if there ever is an error
   expr.use( ( err, req, res, next ) => {
      console.error( err.stack || err.message )
      res.send( 500, `server error: ${ err.message }`)
   })

}