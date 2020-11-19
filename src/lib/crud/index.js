/**
 * module for the CRUD service
 * Create, Read, Update, Delete on the filesystem
 * @module crud
 */


const { fs, path } = require('../.helper'),
basedir = path.join(__dirname, '/../../../.data')

module.exports = {
	//create a file
	create: async ( file, route, data ) => {
		return new Promise( ( rsl, rej ) => {
			//try to open the file
			fs.open( `${basedir}${route}/${file}.json`, 'wx', ( err, filedesc ) => {
				if( !err && filedesc ) {
					let string_data = JSON.stringify(data)
					fs.writeFile( filedesc, string_data, (err) => {
						if(!err) { 
							fs.close( filedesc, (err) => {
								if(!err) {
									rsl(true);
								} else { rej( err ) }
							})
						} else { rej( err ) }
					})
				} else { 
					rej( err )  }
			})
		})
	},

	read: async ( file ) => {
		return new Promise( ( rsl, rej ) => {
			fs.readFile( file, 'utf-8', ( err, data ) => {
				if(err) { 
					console.log('no file found.')
					rej(err) 
				} else { rsl(data) }
			})
		})
	},

	update: async ( dir, file, data) => {
		return new Promise( ( rsl, rej ) => {
			//open the file
			fs.open( `${basedir}${dir}/${file}.json`, 'r+', ( err, filedesc ) => {
				if(!err && filedesc) {
					let string_data = JSON.stringify(data)

					fs.ftruncate( filedesc, (err) => {
						if(!err) {
							fs.writeFile( filedesc, string_data, (err) => {
								if(!err) {
									fs.close( filedesc, (err) => {
										if(!err) { rsl(true) }
											else { rej( err ) }
									})
								} else { rej( err) }
							})
						} else { rej( err ) }
					})
				} else { rej( err ) }
			})
		})
	},

	delete: async (  dir, file ) => {
		return new Promise( ( rsl, rej) => {
			fs.unlink( basedir + dir + '/' + file + '.json', (err) => {
				if(!err) { rsl(true) }
					else { rej( err ) }
			})
		})
	}
}