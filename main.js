const expr = require('express')()
const { Shibboleth } = require('shibboleth'),
CONF = require('./lib/.config')

let http = require('http'), https = require('https'),
fs = require('fs'),
options = {
	key: fs.readFileSync(`./lib/security/${CONF.env.key_name}`),
	cert: fs.readFileSync(`./lib/security/${CONF.env.cert_name}`)
}



expr.use( require('body-parser').json() ) 
expr.use( require('body-parser').urlencoded({ extended: true }) )
expr.use( require('cors')() ) 

require('./controller/router')( expr )

//start the https server, passing the options and the express object
https.createServer( options, expr ).listen( CONF.env.port_https, () => {
	console.log( `server's running on port ${ CONF.env.port_https }`)
})
