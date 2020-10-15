let request = require('request'),
fs = require('fs'),
glob = require('glob'),
path = require('path');
const formHandler = require('../forms'),
crud = require('../../lib/crud')

const ticket = require('../../lib/models/ticket')

let { TreeNode, Tree } = require('./tree.js');

const IDS = {
	incident: "6dd53665c0c24cab86870a21cf6434ae"
}

module.exports = class Cherwell {
	access_token = '';
	refresh = {
		token: '',
		expires_in: '',
		fresh: true,
		error: ''
	};	
	#user = "";
	#password = "";
	#client_id = "";
	base_url = "";
	tenant = "";
	incidentCatalog = {};
	hrCaseCatalog = {};
	hrCaseSubcategories = [];
	incidentSubcategories = [];

	formHandler = formHandler;

	/*********
	constructor
	takes passed-in params and assigns them
	**********/
	constructor(params) {
		this.user = params.user;
		this.password = params.password;
		this.client_id = params.client_id;
		this.base_url = params.base_url;
		this.tenant = params.tenant;
		//load the forms
		glob.sync('./src/old/forms/*.json').forEach((file) => {
			
			crud.read( file ).then( form => {
				form = JSON.parse( form )
				console.log(`file path: ${file}\nform:\n${form}`)
				this.formHandler.add(form);
			})
		});

		this.requestToken().then( expires_in => {
			console.log("-->> starting refresh timer...")
			this.tokenRefreshTimer(expires_in)
			//get the incident service catalog
			this.getIncidentCatalog().then( catalog => {
				this.incidentCatalog = catalog;
			}).catch( error => { console.log(error); });
			//get the HRCase service
			this.getHRCaseCatalog().then( obj => {
				this.hrCaseCatalog = obj;
			}).catch( error => { console.log(error); });

		}).catch( e => {
			console.log(e)
		})
	}

	/*********
	async getToken
	sends a request to Cherwell for an access token
	runs asynchronously, returning a Promise. if rejected, throws an error.
	**********/
	async requestToken() {
		return new Promise( (resolve, reject) => {
			let success = false;
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
					this.refresh.expires_in = new Date().getTime() + (body.expires_in * 1000)

					console.log(`expires in: ${this.refresh.expires_in}`)
					console.log('backend/cherwell/index.js[requestToken]: connection estabished; token received.');
					resolve( this.refresh.expires_in );
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

	tokenRefreshTimer(expiry) {
		let time = expiry - new Date().getTime()
		setTimeout( () => {
			this.refreshToken().then( expires_in => {
				console.log("--->> token refreshed! starting refresh timer (again)...")
				this.tokenRefreshTimer( expires_in )
			}).catch( e => {
				console.log(e)
			})
		}, time )
	}


	/*********
	tokenRefresh
	after a token is requested, this is run to start a refresh timer

	params
		expiry: the time until the token expires, in seconds. this is given when a token is requested
	**********/
	async refreshToken() {
		return new Promise( (resolve, reject) => {
			//creat the object for the request
		 let options = {
		 	url: `${this.base_url}/CherwellAPI/token`,
			method: 'POST',
			headers: {
				'api-key': this.client_id,
				'Content-Type': 'x-www-form-urlencoded'
			},
			auth: {
				bearer: this.access_token 
			},
			form: {
				grant_type: 'refresh_token',
				client_id: this.client_id,
				refresh_token: this.refresh.token
			}
		 };
		 //make the request
		 console.log('backend/cherwell/index.js[refreshToken]: requesting token refresh...');
		 request(options, (err, res, body) => {
		 	body = JSON.parse(body);
		 	if(res.statusCode == 200) {
		 		//get the data from the body
		 		this.access_token = body.access_token,
		 		this.refresh.token = body.refresh_token,
		 		this.refresh.expires_in = new Date().getTime() + (body.expires_in * 1000),
		 		//set fresh to true
		 		this.refresh.fresh = true;
		 		//restart the timer with the new expires_in value
		 		console.log('backend/cherwell/index.js[refreshToken]: token refresh successful.');
		 		resolve(this.refresh.expires_in);

		 	} else {
		 		this.refresh.fresh = false;
		 		this.refresh.error = err;
		 		reject(this.refresh.error);
		 	}
		 });
		})
	}

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

	/*********
	async getObjectTemplate
	sends a GET request to Cherwell for the business object template based on the object ID
	runs asynchronously, returning a Promise. if resolved, it sends business object template; if rejected, throws an error.
	
	params
		obj_id: the business object ID
		required: if set to true, Cherwell returns only the fields that are required. set to false by default 
	**********/
	async getObjectTemplate(obj_name, required = false, fields = []) {
		return new Promise( (resolve, reject) => {
			//get the object id
			this.getObjectId(obj_name).then( objid => { 
				//set the options for the request call
				let options = {
					url: `${this.base_url}/CherwellAPI/api/V1/getbusinessobjecttemplate`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					auth: {
						bearer: this.access_token 
					},
					form: {
						busObId: objid,
						fields: fields,
						includeRequired: required,
						includeAll: !required
					}
				};

				//send the request and return the promise based on the success or fail
				request(options, (err, res, body) => {
					//parse the body
					body = JSON.parse(body);
					//if the status isn't OK, reject with the error that was sent
					if ( body.hasError ) {
						reject({ status: res.statusCode, errorCode: body.errorCode, message: body.errorMessage });
					} 
					//if it is, resolve and send the object ID and template
					else {
						resolve( {objId: objid, template: body} );
					}
				});
			}).catch( error => { reject(error); });		
		});
	}

	/*********
	async getFields
	sends requests to Cherwell for the fields based on the object name
	runs asynchronously, returning a Promise. if resolved, it sends the fields array; if rejected, throws an error.
	
	params
		obj_name: name of the business object
		required: if set to true, Cherwell returns only the fields that are required. set to true by default 
	**********/
	async getFields(obj_name, required = false) {
		return new Promise( (resolve, reject) => {
				//then get the object template based on the name
				this.getObjectTemplate(obj_name, required).then((result) => {
					//send the fields back
					resolve(result.template.fields);
				}).catch( error => { reject(error); });
		});
	}

	/*********
	async createObject
	creates the object to be sent to Cherwell
	runs asynchronously, returning a Promise. if resolved, it sends the created object; if rejected, throws an error.
	
	params
		obj_name: name of the business object
		data: the data for the object fields
	**********/
	async createObject(obj_name, data) {
		return new Promise( (resolve, reject) => {
			//first, get the object template
			this.getObjectTemplate(obj_name).then((result) => {
				//set the object values from the result
				let fields = result.template.fields;
				let obj = { 
					busObId: result.objId,
					fields: []
				};
				//then set the field values from the data
				fields.forEach(field =>  {
					data.fields.forEach(item => {
						if(item.name == field.name) {
							//insert the value, and set dirty to true
							if(item.name == "Description") { field.html = item.html; }
							field.value = item.value;
							field.dirty = true;
							//add field to object array
							obj.fields.push(field);
						}
					});
				});
				//send the object back in the resolve
				resolve(obj);
			}).catch(error => { reject(error); });
		});
	}

	/*********
	async submitObject
	sends the object to Cherwell for creation
	runs asynchronously, returning a Promise. if rejected, throws an error.

	params
		obj: the business object to be submitted
		persist: if false, Cherwell will cache and send back a cache key. if true, Cherwell saves permanently. set to true by default.
	**********/
	async submitObject(obj, persist = true) {
		return new Promise( (resolve, reject) => {
			try {
				//set the persist value
				obj.persist = persist;
				//set the options for the request call
				let options = {
					url: `${this.base_url}/CherwellAPI/api/V1/savebusinessobject`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					auth: {
						bearer: this.access_token
					},
					form: obj
				};

				request(options, (err, res, body) => {
					body = JSON.parse(body);
					if( res.statusCode != 200 ) {
						console.log(body);
						let msg = body.Message ? body.Message : body.errorMessage;
						reject({ status: res.statusCode, errorCode: body.errorCode, message: msg });
					}
					else {
						resolve(body);
					}
				});
			}
			catch(error) {
				console.log('error: \n', error);
				reject(error);
			}
		});
	}

	/*********
	getForm
	get the form from the form handler if it exists. if it doesn't, send the default form for that business object

	params
		data: the form data received from the client
	**********/
	getForm(params, callback) {
		//get the classification parameters
		let service = params.service,
		category = params.category,
		subcategory = params.subcategory;
		try {
			if(typeof(this.formHandler.forms[service]) == 'object') {
				//check and see if there's a form
				let form = this.formHandler.forms[service].find(form => (form.category == category && form.subcategory == subcategory));
				//if there is, run the callback with the form
				if(form) {
					callback(null, form);
				} else { callback({status: 500, message: "this categorization doesn't exist" }, null); }
			} else {
				//if there was no form, check the subcategories to get the default form
				let result = this.isSubcategory(subcategory);

				if(result.found) {
					let form = this.formHandler.forms.defaults.find(form => form.type == result.type);
					if(form) { 
						//set the classification of the request, and send the form to the callback
						form.service = service, form.category = category, form.subcategory = subcategory;
						form.tenant = this.tenant;
						form.fields.push({ name: "OwnedByTeam", value: result.team });
						
						callback(null, form); 
					}
				} else {
					callback({ status: 404, message: "this categorization doesn't exist" }, null);
				}
			}
		} catch(error) {
			console.log('there was an error:\n', error);
			callback({ status: 500, message: error }, null);
		}
	}

	/*********
	async processFormData
	takes the form data sent from the client and processes it for submission to Cherwell
	runs asynchronously, returning a Promise with the fields array. if rejected, throws an error.

	params
		data: the form data received from the client
	**********/
	async processFormData(data) {
		return new Promise( (resolve, reject) => {
			//this try-catch block is in case we get some junk that we shouldn't
			try {
				if(!data) { reject(new Error('no form data given')); }
				else {
					let queries = "";
					//process the form queries
					data.queries.forEach( query => {
						if(query.type == 'file') {
							data.file = {
								filename: query.filename,
								value: query.value,
								size: query.size
							}
						}
						//if a query has a fieldName, add it directly to the field array
						if(query.fieldName) {
							data.fields.push({ name: query.fieldName, value: query.value });
						}
						//if value is an array, convert it to string and add a space after commas
						if ( Array.isArray(query.value) ) {
							query.value = query.value.toString().replace(/\,/g, ", ");
						} 

						queries += `<p><b>${query.text}</b><br />${query.value}</p>`;

						if(query.subqueries != null) {

							query.subqueries.forEach(subqry => {
								if ( Array.isArray(subqry.value) ) {
									subqry.value = subqry.value.toString().replace(/\,/g, ", ");
								}

								queries += `<p><b>${subqry.text}</b><br />${subqry.value}</p>`;
							});
						}
					});
					//once all of the queries have been processed, add the form string to the Description and the classifications
					data.fields.push({ name: `${ data.type == "HRCase" ? 'CaseType' : 'Service' }`, value: data.service }, 
						{ name: "Category", value: data.category }, 
						{ name: "Subcategory", value: data.subcategory },
						{ name: 'Tenant', value: data.tenant });

					//if there's no Description in fields, set it to the queries
					let desc = data.fields.find(field => field.name == "Description");
					if(!desc) {
						data.fields.push({ name: 'Description', value: queries });
					}

					//if there's no ShortDescription fields, set it to the title.
					let shortdesc = data.fields.find(field => field.name == "ShortDescription");
					if(!shortdesc) {
						data.fields.push({ name: 'ShortDescription', value: data.title });
					}

					resolve(data);
				}


			} catch(error) {
				console.log('an error occured.');
				console.log(error);
				reject(error);
			}
		});
	}

	/*********
	async getIncidentCatalog
	gets the subcategory table for Incidents, filtered by tenant
	runs asynchronously, returning a Promise with the array of subcategory business objects.
	**********/
	async getIncidentCatalog() {
		return new Promise ( (resolve, reject) => {
			//create an options object for the request
			let options = {
				url: `${this.base_url}/CherwellAPI/api/V1/getsearchresults`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				auth: {
					bearer: this.access_token
				},
				form: {
  				"busObId": "934986ba1e6ea051a9def5461fbe8d4434cd5c3b45", 
  				"fields": [
    				"9383926e91c152713807534b1bb2833dea26addd52", 
 						"94587716d79a903ab210be471e9716eafd33b585f8" 
  				],
				  "filters": [
				    {
				      "fieldId": "943af1e9f1743e5417b8d04ab3a4cceb53e2beb299", 
				      "operator": "eq",
				      "value": this.tenant
				    }
				  ],
				  "includeSchema": false
				}
			};
			
			//make the request to Cherwell
			console.log('backend/cherwell/index.js[getIncidentCatalog]: requesting Incident catalog...');
			request(options, (err, res, body) => {
				body = JSON.parse(body);
				//if the status isn't 200, reject it
				if (res.statusCode != 200 ) {
					let msg = body.Message ? body.Message : body.errorMessage;
					console.log('backend/cherwell/index.js[getIncidentCatalog]: there was an error.');
					console.log('error: ', err);
					console.log('body: ', body);
					reject({ status: res.statusCode, errorCode: body.errorCode, message: msg });
				} else {
					console.log('backend/cherwell/index.js[getIncidentCatalog]: catalog received');
					//if it is, create the catalog
					let catalog = new Tree( new TreeNode('Incident') );
					//go through each object to add the layers
					body['businessObjects'].forEach( subcat => {
						//get the categorization
						let subcategory = subcat.busObPublicId,
						category = subcat.fields.find( el => el.name == "Service"),
						service = subcat.fields.find( el => el.name == "ServiceClassification");

						catalog.add(service.value, 'Incident');
						catalog.add(category.value, service.value);
						catalog.add(subcategory, category.value);
					});
					//when it's created, send it in the resolve method
					console.log(catalog);
					resolve(catalog);
				}
			});
		});
	}

	/*********
	async getHRCaseSubcategories
	gets the subcategory table for HRCases, filtered by tenant
	runs asynchronously, returning a Promise with the array of subcategory business objects.
	**********/
	async getHRCaseCatalog() {
		return new Promise ( (resolve, reject) => {
			//create an options object for the request
			let options = {
				url: `${this.base_url}/CherwellAPI/api/V1/getsearchresults`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				auth: {
					bearer: this.access_token
				},
				form: {
				  "busObId": "941feae60c7618e5ec4d7944488006cecc9f01b40a", //CaseSubcategory
				  "fields": [
				    "941feb0185935188c7d4994fde91d423681aae2502", //Category
				 		"941feb0506018ccc201f5c48b6bc431c5f70afa43a", //Case Type
				  	"941feb07a99610373464554273990bbd18cffb90d6" //Default Team
				  ],
				  "filters": [
				    {
				      "fieldId": "943c7e1b7385124f30216f4d0385b3896435977789", //filter by the Tenant field
				      "operator": "eq",
				      "value": this.tenant
				    }
				  ],
				  "includeSchema": false,
				  "sorting": [
				    {
				      "fieldId": "string",
				      "sortDirection": 0
				    }
				  ]
				}
			};
			//make the request to Cherwell
			request(options, (err, res, body) => {
				body = JSON.parse(body);
				//if the status isn't 200, reject it
				if (res.statusCode != 200 ) {
					let msg = body.Message ? body.Message : body.errorMessage;
					console.log('backend/cherwell/index.js[getHRCaseCatalog]: there was an error.');
					console.log('error: ', err);
					console.log('body: ', body);

					reject({ status: res.statusCode, errorCode: body.errorCode, message: msg });
				} else {
					console.log('backend/cherwell/index.js[getIncidentCatalog]: requesting HRCase catalog...');
					//if it is, create the catalog
					let catalog = new Tree( new TreeNode('HRCase') );
					//go through each object to add the layers
					body['businessObjects'].forEach( subcat => {
						//get the categorization
				
						let subcategory = subcat.busObPublicId,
						category = subcat.fields.find( el => el.name == "Category"),
						service = subcat.fields.find( el => el.name == "CaseType");
						
						catalog.add(service.value, 'HRCase');
						catalog.add(category.value, service.value);
						catalog.add(subcategory, category.value);

						this.hrCaseSubcategories.push( subcat )
					});

					console.log(catalog);
					resolve(catalog);
				}
			});
		});
	}

	isSubcategory(subcategory) {
		let found = false, type = null, team = null;
		//check the incident subcategories
		this.incidentSubcategories.forEach( object => {
			if( object.busObPublicId == subcategory ) { 
				found = true, type = "Incident"; 
				object.fields.forEach( field => {
					if (field.name = 'DefaultTeam') { team = field.value; }
				});
			}
		});
		//check the HRCase subcategories
		this.hrCaseSubcategories.forEach( object => {
			if( object.busObPublicId == subcategory ) { 
				found = true, type = "HRCase"; 
				object.fields.forEach( field => {
					if (field.name = 'DefaultTeam') { team = field.value; }
				});
			}
		});
		//return the found value
		return { found, type, team };
	}

	async attachFileToObject(type, obj) {
		return new Promise( (resolve, reject) => {
			let options = {
				url: `${this.base_url}/CherwellAPI/api/V1/uploadbusinessobjectattachment/filename/${obj.filename}/busobname/${type}/publicid/${obj.publicid}/offset/0/totalsize/${obj.filesize}`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/octet-stream'
				},
				auth: {
					bearer: this.access_token
				},
				body: obj.value,
				form: { 
  				"busobname": `${type}`,
				"publicid": `${obj.publicid}`,
				"offset": 0,
				"totalsize": `${obj.size}`
				}
			};

			request( options, (err, res, body) => {
				if(res.statusCode != 200) {
					let msg = body.Message ? body.Message : body.errorMessage;
					console.log('backend/cherwell/index.js[getHRCaseCatalog]: there was an error.');
					console.log('error: ', err);
					console.log('body: ', body);

					reject({ status: res.statusCode, errorCode: body.errorCode, message: msg });
				} else {
					resolve();
				}
			})
		})
	}

	async search( id, options ) {
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

	async getTicket( objname, ticketid ) {
		return new Promise( (rsl, rej) => {
			
			let req_options = {
				url: `${this.base_url}/CherwellAPI/api/V1/getbusinessobject/busobid/${IDS[objname]}/publicid/${ticketid}`,
				method: 'GET',
				auth: {
					bearer: this.access_token
				}
			}
			console.log( req_options )
			request( req_options, (err, res, body) => {
				body = JSON.parse(body)
				console.log(body)
				if(res.statusCode != 200) {
					rej()
				} else {
					let data = {},
					fields = body.fields

					data.pubId = body.busObPublicId
					data.recId = body.busObRecId

					let field = fields.find( f => f.displayName == 'Tenant' )
					data.tenant = field.value

					field = fields.find( f => f.displayName == "Description")
					data.description = {
						text: field.value,
						html: field.html
					}

					field = fields.find( f => f.displayName == "Created Date Time")
					data.dated = field.value

					field = fields.find( f => f.displayName == 'Short Description' )
					data.subject = field.value

					field = fields.find( f => f.displayName == 'Customer Display Name' )
					data.requestor = field.value

					field = fields.find( f => f.displayName == "Owned By Team")
					data.team = field.value

					field = fields.find( f => f.displayName == "NetID")
					data.netid = field.value

					field = fields.find( f => f.displayName == "Owned By")
					data.owner = field.value

					field = fields.find( f => f.displayName == "Priority" )
					data.priority = field.value

					console.log(data)

					let new_ticket = ticket({
						cherwell: {
							pubId: data.pubId,
							recId: data.recId
						},
						dated: data.dated,
						tenant: data.tenant,
						team: data.team,
						subject: data.subject,
						description: data.description,
						info: {
							owner: data.owner,
							requestor: data.requestor || data.netid,
							priority: data.priority
						},
						priority: data.priority
					})

					rsl(new_ticket) 
				}
			})
		})
	}

	async getObjectSchema( busObId, include ) {
		return new Promise( (rsl, rej) => {
			
			let req_options = {
				url: `${this.base_url}/CherwellAPI/api/V1/getbusinessobjectschema/busobid/${busObId}?includerelationships=${include}`,
				headers: {
					'Content-Type': 'application/json'
				},
				auth: {
					bearer: this.access_token
				}
			}

			request( req_options, (err, res, body) => {
				body = JSON.parse(body)
				if(res.statusCode != 200) {
					let msg = body.Message ? body.Message : body.errorMessage;
					console.log('backend/cherwell/index.js[getSchema]: there was an error.');
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

	async getRelatedObjects( busObRecId, options, busObId = IDS['incident'] ) {
		return new Promise( (rsl, rej) => {
			this.getObjectSchema(busObId, true).then( schema => {
				let relation = schema['relationships'].find( rel => rel['displayName'] == options['displayName'] )
				console.log(`got a relation: ${options['displayName']} ${relation['relationshipId']}`)

				let req_options = {
					url: `${this.base_url}/CherwellAPI/api/V1/getrelatedbusinessobject`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					auth: {
						bearer: this.access_token
					},
					form: {
						parentBusObId: busObId,
						parentBusObRecId: busObRecId,
						relationshipId: relation.relationshipId,
						filters: options.filters,
						fieldsList: options.fields
					}
				}

				request( req_options, (err, res, body) => {
					body = JSON.parse(body)
					if(res.statusCode != 200) {
						let msg = body.Message ? body.Message : body.errorMessage;
						console.log('error: ', err);
						console.log('body: ', body);
	
						rej({ status: res.statusCode, errorCode: body.errorCode, message: msg });
					} else {
						rsl(body['relatedBusinessObjects']);
					}
				})
			})
		})
	}
}