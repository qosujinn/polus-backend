//environment
const ENV = require('./lib/.env'),
Controller = require('./controller'),
util = require('./util')
//node dependencies
const http = require('http'),
https = require('https'),
StringDecoder = require('string_decoder').StringDecoder,
url = require('url'),
fs = require('fs')

const https_options = {
	'key': fs.readFileSync('./lib/security/key.pem'),
	'cert': fs.readFileSync('./lib/security/cert.pem')
}

const server = ( req, res ) => {

	let decoder = new StringDecoder('utf-8'),
	buffer = ''
	//parse the url
	let parsed = url.parse( req.url, true ),
	path = parsed.pathname,
	trimmed = path.replace( /^\/+|\/+$/g, '' ),
	method = req.method.toLowerCase(),
	headers = req.headers,
	query_string = parsed.query

	req.on( 'data', ( data ) => {
		buffer += decoder.write( data )
	})

	req.on( 'end', () => {
		buffer += decoder.end()
		//put the data in an object
		let data = {
			'trimmed': trimmed,
			'query_string': query_string,
			'method': method,
			'headers': headers,
			'payload': util.parseJSON( buffer )
		}

		console.log(`data: ${data}`)
		res.writeHead(200).end()
		
		// Controller.go( trimmed, data ).then( ( result ) => {
		// 	console.log(`index.js: returning this response: ${result.status} ${result.payload}`)
		// 	res.setHeader('Content-Type', 'application/json')
		// 	res.writeHead(result.status).end( JSON.stringify(result.payload) )
		// }).catch( ( result ) => {
		// 	console.log(`index.js: returning this response: ${result.status} ${result.payload}`)
		// 	res.writeHead(result.status).end(result.err.message)
		// })
	})

},

server_http = http.createServer( ( req, res ) => {
	server( req, res )
}),

server_https = https.createServer( ( req, res ) => {
	server( req, res )
})

server_http.listen( ENV.port_http, () => {
	console.log(`index.js: HTTP server listening at port ${ ENV.port_http }`)
})

server_https.listen( ENV.port_https, () => {
	console.log(`index.js: HTTPS server listening at port ${ ENV.port_https }`)
})
