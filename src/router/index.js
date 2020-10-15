const expr = require('express')(),
passport = require('passport'),
session = require('express-session'),
SAML = require('passport-saml').Strategy

const { env, shibb } = require('../../config')
const { fs } = require('../.helper')

let strategy = new SAML(
   {
      issuer: shibb.url,
      callbackUrl: shibb.callback,
      entryPoint: shibb.entry,
      privateCert: fs.readFileSync( shibb.cert_sp, 'utf-8' ),
      decryptionPvk: fs.readFileSync( shibb.key_sp, 'utf-8' ),
      cert: fs.readFileSync( shibb.cert_idp, 'utf-8' ),
      validateInResponseTo: false
   }, ( profile, done ) => {
      return done( null,
         {
           id: profile.uid,
           email: profile.email,
           displayName: profile.cn,
           firstName: profile.givenName,
           lastName: profile.sn
         })
   }
)

expr.use( require('body-parser').json() ) 
expr.use( require('body-parser').urlencoded({ extended: true }) )
expr.use( require('cookie-parser')() )
expr.use( session( { secret: env.session_secret } ) )
expr.use( require('cors')() )
expr.use( passport.initialize() )
expr.use( passport.session() )

passport.use( strategy )

expr.get('/login', 
   ensureAuth,
   ( req, res ) => {
      res.send('Authenticated')
})

expr.get('/s/shibboleth', 
   passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
   ( req, res) => {
      res.redirect('/login')
})

expr.post('/s/shibboleth/callback', 
   require('body-parser').urlencoded({ extended: false }),
   passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
   ( req, res ) => {
      res.redirect('/login')
})

expr.get('/s/shibboleth/fail', ( req, res ) => {
   res.status(401).send('login failed')
})

expr.get('/s/shibboleth/Shibboleth.sso/Metadata', ( req, res ) => {
   res.type('application/xml')
   res.status(200).send( strategy.generateServiceProviderMetadata(fs.readFileSync( shibb.cert_sp, 'utf-8')) )
})

module.exports = expr

function ensureAuth( req, res, next ) {
   if( req.isAuthenticated() ) {
      return next()
   } else {
      return res.redirect('/s/shibboleth')
   }
}