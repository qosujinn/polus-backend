let { request } = require('../../.helper')

module.exports = ( id, options ) => {
	return new Promise ( (rsl, rej) => {
		console.log(options)
		let req_options = {
			url: `${this.base_url}/CherwellAPI/api/V1/getsearchresults`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			auth: {
				bearer: this.access_token
			},
			form: { 
				"busObId": id,
				"fields": options.fields,
				"filters": options.filters,
				"pageSize": options.pageSize || 200,
				"includeAll": !options.fields.length
			}
		}

		request( req_options, (err, res, body) => {
			body = JSON.parse(body)
			if(res.statusCode != 200) {
				let msg = body.Message ? body.Message : body.errorMessage;
				console.log('backend/cherwell/index.js[search]: there was an error.');
				console.log('error: ', err);
				console.log('body: ', body);

				rej({ status: res.statusCode, errorCode: body.errorCode, message: msg });
			} else {
				console.log(`search result: ${body}`)
				rsl(body);
			}
		})
	})
}
