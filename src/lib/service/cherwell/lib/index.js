/**
 * library file for the Cherwell service
 * created by: 
 * 
 */

const CONF = require('../../.app').CONF,
request = require('request')

module.exports = {

   async requestToken() {
		return new Promise( (res, rej) => {
			//set options for the request call
			let options = {
				url: `${this.base_url}/CherwellAPI/token`,
				method: 'POST',
				headers: {
					'api-key': this.client_id,
					'Content-Type': 'x-www-form-urlencoded'
				},
				form: {
					grant_type: 'password',
					client_id: this.client_id,
					username: this.user,
					password: this.password,
				}
			};
			//send the request and set the promise based on the success or fail
			request(options, (err, res, body) => {
				//parse the body
				body = JSON.parse(body);
				//if it's successful, set the acces_token and resolve
				if(res.statusCode == 200) {
					console.log()
					this.access_token = body.access_token,
					this.refresh.token = body.refresh_token,
					this.refresh.expires_in = (body.expires_in * 1000),
					
					this.refreshtimer(this.refresh.expires_in);

					console.log('backend/cherwell/index.js[requestToken]: connection estabished; token received.');
					resolve();
				}
				//if not, reject with the error that was sent
				else {
					console.log('backend/cherwell/index.js[requestToken]: there was an error.');
					console.log(`response: ${res}`);
					console.log(`body: ${body}`);
					reject({ status: res.statusCode, errorCode: body.errorCode, message: body.errorMessage });
				}
			});
		});
	}
}