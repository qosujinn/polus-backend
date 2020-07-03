const expr = require('express')()
const { Shibboleth } = require('shibboleth'),
CONF = require('./lib/.config'),
shibb = new Shibboleth( CONF.shibboleth.url )

let http = require('http'), https = require('https'),
fs = require('fs'),
options = {
	key: fs.readFileSync(`./lib/security/${CONF.env.key_name}`),
	cert: fs.readFileSync(`./lib/security/${CONF.env.cert_name}`)
}



expr.use( require('body-parser').json() ) 
expr.use( require('body-parser').urlencoded({ extended: true }) )
expr.use( require('cors')() ) 

//start the https server, passing the options and the express object
https.createServer( options, expr ).listen( CONF.env.port_https, () => {
	console.log( `server's running on port ${ CONF.env.port_https }`)
})

http.createServer( ( req, res ) => {
	let redirect = `https://${CONF.env.domain}`

	if( CONF.env.port_https != 443 )
		redirect += `:${CONF.env.port_https}`

	redirect += req.url
	res.writeHead( 301, { 'Location': redirect }).end()
}).listen( CONF.env.port_http, () => {
	console.log(`http server's running on port ${ CONF.env.port_http }`)
})

require('./controller/router')( expr )
