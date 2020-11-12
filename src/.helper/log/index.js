/**
 * log
 * stores and rotates logs
 */

const fs = require('fs'),
path = require('path'),
zlib = require('zlib'),
basedir = path.join( __dirname, '/../../../.logs/')

module.exports = () => ({
   basedir: basedir,
   
   /**
    * appends a string to the referenced log file
    * @param {string} file - name of the file 
    * @param {string} str - string to be appended
    */
   append( filepath, str ) {
      //open the file
      fs.open( `${this.basedir + filepath }.log`, 'a', (err, fileDesc) => {
         if( !err && fileDesc ) {
            //append to the file and close it
            fs.appendFile( fileDesc, str+'\n', (err) => {
               if( !err ) {
                  fs.close( fileDesc, (err) => {
                     if( !err ) {
                        return true
                     } else {
                        return err
                     }
                  })
               } else {
                  return err
               }
            })
         } else {
            return err
         }
      })
   },

   /**
    * rotates log files and starts the rotation loop, rotating every 24hrs
    */
   rotate(){
      rotateLogs()
      rotationLoop()
   },

   /**
    * compresses the saved logs
    */
   rotateLogs() {
      try {
         let list = list(false)
         if( list && list.length > 0 ) {
            list.forEach( (log) => {
               //compress data to a different file
               let logId = log.replace('.log', ''),
               fileId = `${logId}_${Date.now()}`
               
               compress( logId, fileId )
               truncate( logId )
            })
         }
      } catch (e) {
         console.log( e )
      }
   },

   /**
    * a loop for rotating log files on an interval
    */
   rotationLoop() {
      setInterval( () => {
         rotateLogs()
      }, 1000 * 60 * 60 * 24 )
   },

   /**
    * gets a list of the saved logs, and optionally compressed logs
    */
   list( include ) {
      fs.readdir( basedir, ( err, data ) => {
         if( !err && data && data.length > 0 ) {
            let trimmedNames = []
            data.forEach( (file) => {
               //add the log files
               if( file.indexOf('.log') > -1 ) {
                  trimmedNames.push( file.replace('.log', '') )
               }

               if( file.indexOf('.gz.b64') > -1 && include ) {
                  trimmedNames.push( file.replace('gz.b64'), '')
               }
            })
            return trimmedNames
         } else {
            throw err 
         }
      } )
   },

   /**
    * compresses the contents of a log file into a .gz.b4 file 
    */
   compress( logId, fileId ) {   
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
                        fs.writeFile( fileDesc, buffer.toString('base64'), (err) => {
                           if( !err ) {
                              //close destination file
                              fs.close( fileDesc, (err) => {
                                 if( !err ) {
                                    return true
                                 } else {
                                    throw err
                                 }
                              })
                           } else {
                              throw err
                           }
                        })
                     } else {
                        throw err
                     }
                  })
               } else {
                  throw err
               }
            })
         } else {
            throw err
         }
      })
   },

   /**
    * decompresses the given log file
    */
   decompress( fileId ) {
      let file = fileId+'.gz.b64'
      fs.readFile( `${basedir + file}`, 'utf-8', (err, str) => {
         if( !err && str) {
            //decompress the data
            let input = Buffer.from( str, 'basse64' )
            zlib.unzip( inputBuffer, (err, output) => {
               if( !err && output ) {
                  //return the string
                  let str = output.toString()
                  return str
               } else {
                  throw err
               }
            })
         } else {
            throw err
         }
      })
   },
   /**
    * truncates log files
    */
   truncate( logId ) {
      fs.truncate(`${basedir + logId}.log`, 0, (err) => {
         if( !err ) {
            return true
         } else {
            throw err
         }
      })
   }
})