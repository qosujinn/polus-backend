const expr = require('express')(),
CONF = require('./lib/.config')

let http = require('http'), https = require('https'),
fs = require('fs'),
options = {
	key: fs.readFileSync('./lib/security/key.pem'),
	cert: fs.readFileSync('./lib/security/cert.pem')
}

//express middleware
let passport = require('passport'),
morg = require('morgan'),
sess = require('express-session'),
shibb = require('passport-uwshib')

expr.use( require('body-parser').json() ) 
.use( require('body-parser').urlencoded({ extended: true }) )
.use( require('cors')() ) 
.use( passport.initialize() )
.use( passport.session() )
.use( require('cookie-parser') )
.use( morg(CONF.logformat || 'dev') )
.use( sess({ 
	secret: fs.readFileSync( './lib/security/sess-secret.txt', 'utf-8' ),
	cookie: { secret: true },
	resave: false,
	saveUninitialized: false 
}) )

//create the Shibboleth strategy
let shibbstrat = new shibb.Strategy( {
	entityId: CONF.domain,
	privateKey: options.key,
	callbackUrl: '/auth/callback',
	domain: CONF.domain,
	acceptedClockSkewMs: 200
})
//tell Passport to use it
passport.use( shibbstrat )

//serialize and deserialize calls for user sessions
passport.serializeUser( ( user, done ) => {
	done( null, user )
})

passport.deserializeUser( ( user, done ) => {
	done( null, user )
})

expr.get('/auth', passport.authenticate( shibbstrat.name ), shibb.backToUrl() )
expr.post('/auth/callback', passport.authenticate( shibbstrat.name ), shibb.backToUrl() )
expr.get( shibb.urls.metadata, shibb.metadataRoute( shibbstrat, options.cert ) )

expr.use( shibb.ensureAuth('/auth') )

//pass the express object to the router
require('./controller/router')( expr )

//start the https server, passing the options and the express object
https.createServer( options, expr ).listen( CONF.env.port_https, () => {
	console.log( `server's running on port ${ CONF.env.port_https }`)
})

http.createServer( ( req, res ) => {
	let redirect = `https://${CONF.domain}`

	if( CONF.env.port_https != 443 )
		redirect += `:${CONF.env.port_https}`

	redirect += req.url
	res.writeHead( 301, { 'Location': redirect }).end()
}).listen( CONF.env.port_http )
