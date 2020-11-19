const { get } = require('../../../models/dashboard')

let { request } = require('../../../.helper'),
CONFIG = require('../../../.helper').CONF.cherwell,
req_options = request.OPTS

req_options.setURL( CONFIG.baseurl )
let logger = require('../../../.helper').logger()

module.exports = {

	async getSearchResults( options ) {
		try { 
			console.log('search; hit')
			req_options.setHeaders( {
				'api-key': CONFIG.client_id,
				'Authorization': `Bearer ${CONFIG.token.access}`
			})
			let post = request(req_options.url, req_options.headers, 'POST', 'json', 200, 404),
			result = post( '/api/V1/getsearchresults', options )
			if( result ) {
				console.log( result )
				return result
			} else {
				return null
			}
		} catch( e ) {
			console.log( e )
			return null
		}
	}
}
