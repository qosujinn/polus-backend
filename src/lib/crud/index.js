/**
 * module for the CRUD service
 * Create, Read, Update, Delete on the filesystem
 * @module crud
 */


const { fs, path } = require('../../.helper'),
basedir = path.join(__dirname, '/../../old')

module.exports = {
	//create a file
	create: async ( filename, route, data ) => {
		return new Promise( ( rsl, rej ) => {
			//try to open the file
			fs.open( `${basedir}${route}/${filename}.json`, 'wx', ( err, filedesc ) => {
				if( !err && filedesc ) {
					let string_data = JSON.stringify(data)
					fs.writeFile( filedesc, string_data, (err) => {
						if(!err) { 
							fs.close( filedesc, (err) => {
								if(!err) {
									rsl(true);
								} else { rej( new Error('error closing new file') ) }
							})
						} else { rej( new Error('error writing to new file') ) }
					})
				} else { 
					rej( new Error( err ) )  }
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
	}

	// update: async ( basedir, dir, file, data) => {
	// 	return new Promise( ( rsl, rej ) => {
	// 		//open the file
	// 		fs.open( `${basedir}${dir}/${file}.json`, 'r+', ( err, filedesc ) => {
	// 			if(!err && filedesc) {
	// 				let string_data = JSON.stringify(data)

	// 				fs.ftruncate( filedesc, (err) => {
	// 					if(!err) {
	// 						fs.writeFile( filedesc, string_data, (err) => {
	// 							if(!err) {
	// 								fs.close( filedesc, (err) => {
	// 									if(!err) { rsl(true) }
	// 										else { rej( new Error( 'error closing existing file' ) ) }
	// 								})
	// 							} else { rej( new Error( 'error writing to existing file' ) ) }
	// 						})
	// 					} else { rej( new Error( 'error truncating existing file' ) ) }
	// 				})
	// 			} else { rej( new Error( 'error opening file. may not exist' ) ) }
	// 		})
	// 	})
	// },

	// delete: async ( basedir, dir, file ) => {
	// 	return new Promise( ( rsl, rej) => {
	// 		fs.unlink( basedir + dir + '/' + file + '.json', (err) => {
	// 			if(!err) { rsl(true) }
	// 				else { rej( new Error( 'error deleting file' ) ) }
	// 		})
	// 	})
	// }
}