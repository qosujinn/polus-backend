/**
 * log
 * stores and rotates logs
 */

const fs = require('fs'),
path = require('path'),
zlib = require('zlib'),
util = require('util'),
basedir = path.join( __dirname, '/../../../.logs/') 

module.exports = () => ({
   log( filepath, str ) {
      if( typeof(str) !== 'string' ) {
         throw new Error(`[logger] must pass a string to the logger!`)
      }

      append( filepath, str, ( err ) => {
         if( err ) {
            console.log('logging to file failed')
         }
      })
   },

   /**
    * creates a debug logger for the given name
    * @param {string} name - name of the module 
    */
   debug( name ) {
      let debug = util.debugLog( name )
      return debug
   },

   /**
    * rotates log files and starts the rotation loop, rotating the logs every 24hrs
    */
   async rotate() {
      return new Promise( async ( rsl, rej ) => {
         try {
            console.log(`[radio/boot/logger] rotating logs...`)
            let done = await rotateLogs()
            if( done ) {
               rotationLoop()
               console.log('[radio/boot/logger] logs rotated')
               rsl()
            }
         } catch(e) {
            console.log( e )
            rsl()
         }
      })
   },

   decompress( fileId, callback ) {
      let file = fileId+'.gz.b64'
      fs.readFile( `${basedir + file}`, 'utf-8', (err, str) => {
         if( !err && str) {
            //decompress the data
            let input = Buffer.from( str, 'basse64' )
            zlib.unzip( input, (err, output) => {
               if( !err && output ) {
                  //return the string
                  let str = output.toString()
                  callback( false, str )
               } else {
                  callback( err )
               }
            })
         } else {
            callback( err )
         }
      })
   }
})

/**
 * appends a string to the referenced log file
 * @param {string} file - name of the file 
 * @param {string} str - string to be appended
 */
function append( filepath, str, callback ) {
   //open the file
   fs.open( `${basedir + filepath }.log`, 'a', (err, fileDesc) => {
      if( !err && fileDesc ) {
         //append to the file and close it
         fs.appendFile( fileDesc, str+'\n', (err) => {
            if( !err ) {
               fs.close( fileDesc, (err) => {
                  if( !err ) {
                     callback( false )
                  } else {
                     callback( 'error closing file that was being appended' )
                  }
               })
            } else {
               callback( 'error appending to file' )
            }
         })
      } else {
         callback( 'could not open file for appending' )
      }
   })
}

/**
 * compresses the saved logs
 */
async function rotateLogs() {
   return new Promise( ( rsl, rej ) => {
      //get the list of log files
      list(false, ( err, files ) => {
         if( !err && files && files.length > 0 ) {
            //take each file...
            files.forEach( (log) => {
               //...and compress data to a different file
               let logId = log.replace('.log', ''),
               fileId = `${logId}_${Date.now()}`
               
               compress( logId, fileId, ( err ) => {
                  if( !err ) {
                     truncate( logId, ( err ) => {
                        if( err ) { 
                           console.log( '[logger] error truncating log file')
                        } else {
                        }
                     })
                  } else {
                     console.log('[logger] error compressing a log file', err )
                  }
               })
            })
            rsl( true )
         } else {
            console.log('[logger] could not find log files to rotate')
            rsl( true )
         }
      })
   })
}

/**
 * a loop for rotating log files on an interval
 */
function rotationLoop() {
   setInterval( () => {
      rotateLogs()
   }, 1000 * 60 * 60 * 24 )
}

/**
 * gets a list of the saved logs, and optionally compressed logs
 */
function list( include, callback ) {
   try {
      fs.readdir( basedir, ( err, data ) => {
         let trimmedNames = []
         if( !err && data && data.length > 0 ) {
            data.forEach( file => {
               //add the log files
               if( file.indexOf('.log') > -1 ) {
                  trimmedNames.push( file.replace('.log', '') )
               }

               if( file.indexOf('.gz.b64') > -1 && include ) {
                  trimmedNames.push( file.replace('gz.b64'), '')
               }
            })
            callback( false, trimmedNames )
         } else {
            callback( err, data )
         }
      })
   } catch(e) {
      console.log( `[logger] ${e}` )
   }
}

/**
 * truncates log files
 */
function truncate( logId, callback ) {
   fs.truncate(`${basedir + logId}.log`, 0, (err) => {
      if( !err ) {
         callback( false )
      } else {
         callback( err )
      }
   })
}

/**
 * compresses the contents of a log file into a .gz.b4 file 
 */
function compress( logId, fileId, callback ) {   
   let source = logId +'.log',
   dest = fileId+'.gz.b64'
   //read the source
   fs.readFile( `${basedir + source}`, 'utf-8', (err, input) => {
      if(!err && input) {
         //compress using gzip
         zlib.gzip( input, (err, buffer ) => {
            if( !err && buffer ) {
               //send the data to the destination file
               fs.open(`${basedir + dest}`, 'wx', (err, fileDesc) => {
                  if( !err && fileDesc ){
                     //write to destination file
                     fs.writeFile( fileDesc, buffer.toString('base64'), (err) => {
                        if( !err ) {
                           //close destination file
                           fs.close( fileDesc, (err) => {
                              if( !err ) {
                                 callback( false )
                              } else {
                                 callback( err )
                              }
                           })
                        } else {
                           callback( err )
                        }
                     })
                  } else {
                     callback( err )
                  }
               })
            } else {
               callback( err )
            }
         })
      } else {
         callback( err )
      }
   })
}