const CONFIG = require('../../.helper').CONF.cherwell,
{ request, urlencode } = require('../../.helper'),
handles = require('./handles')

let options = helpr.request.OPTS
options.setURL( CONFIG.baseurl )

export default {
   //add handles to the export
   handles,
   
   /*********
	async requestToken
	sends a request to Cherwell for an access token
	runs asynchronously, returning a Promise. if rejected, throws an error.
	**********/
	async requestToken() {
		return new Promise( (resolve, reject) => {
         //get a copy of the OPTS object to use for the request
      
         //set the api-key and the Content-Type for this request
         options.setHeaders( {
            'api-key': CONFIG.client_id,
            'Content-Type': 'x-www-form-urlencoded'
         } )
         //make the form for the request
         let form = {
            grant_type: 'password',
            client_id: CONFIG.client_id,
            username: CONFIG.user,
            password: CONFIG.password,
         }
         //create a post function
         const post = request( options.url, options.headers, 'POST', 'json', 200)
         //fire the request
         post('/token', urlencode( form )).then( ( res ) => {
            //get the tokens and the expire time
            CONFIG.token.access = res.body.access_token,
            CONFIG.token.refresh = res.body.refresh_token,
            CONFIG.token.expires_in = (res.body.expires_in * 1000)
            resolve()
         }).catch( (err) => {
            //log the error, then reject
            console.log('this was the error: \n ', err)
            reject(err)
         })
		});
   },
   
   /*********
	async getObjectId
	sends a GET request to Cherwell for the business object ID based on the object name
	runs asynchronously, returning a Promise. if resolved, it sends business object ID; if rejected, throws an error.
	
	params
		obj_name: name of the business object
	**********/
	async getObjectId(obj_name) {
		return new Promise( (resolve, reject) => {
			//set the options object for the request call
			let options = {
				url: `${this.base_url}/CherwellAPI/api/V1/getbusinessobjectsummary/busobname/${obj_name}`,
				method: 'GET',
				auth: {
					'bearer': this.access_token 
				}
			};

			//send the request and set the promise based on the success or fail 
			request(options, (err, res, body) => {
				//parse the body
				body = JSON.parse(body);
				//if the status isn't OK, reject with the error that was sent
				if(res.statusCode !== 200) {
					reject({ status: res.statusCode, errorCode: body.errorCode, message: body.errorMessage });
				}
				//if it is, resolve and send the ID
				else {
					resolve(body[0].busObId);
				}
			});
		});
	}
}