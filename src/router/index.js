const expr = require('express')(),
passport = require('passport'),
SAML = require('passport-saml').Strategy

const { env } = require('../../config')
const { fs } = require('../.helper')

expr.use( require('body-parser').json() ) 
expr.use( require('body-parser').urlencoded({ extended: true }) )
expr.use( require('cors')() )
expr.use( passport.initialize() )

passport.use( new SAML(
   {
      callbackUrl: 'https://atecsandbox01.utdallas.edu/polus/s/shibboleth/callback',
      entryPoint: 'https://idptest.utdallas.edu',
      issuer: 'https://atecsandbox01.utdallas.edu/polus/s/shibboleth',
      privateCert: fs.readFileSync( env.cert, 'utf-8' ),
      decryptionPvk: fs.readFileSync( env.cert, 'utf-8' )
   }, ( profile, done ) => {
      findByEmail( profile.email, ( err, user ) => {
         if( err ) {
            return done(err)
         }
         return done( null, user )
      })
   }
) )

expr.get('/login', 
   passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
   ( req, res) => {
      res.redirect('/')
})

expr.post('/s/shibboleth/callback', 
   require('body-parser').urlencoded({ extended: false }),
   passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
   ( req, res ) => {
      res.redirect('/')
})

module.exports = expr