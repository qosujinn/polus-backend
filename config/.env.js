
const envs = {
   localdev: {
      domain: 'http://localhost:9000',
      port_http: 9000,
      port_https: 9010,
      hash_secret: '!AT#C4Ev3R!',
      key: './config/.security/key/local_key.pem', //file path from root
      cert: './config/.security/cert/local_cert.pem' 
   },

   dev: {
      domain: 'https://atecsandbox01.utdallas.edu/polus',
      port_https: 4010,
      hash_secret: '!AT#C4Ev3R!',
      key: './config/.security/key/dev_key.pem',
      cert: './config/.security/cert/dev_cert.pem' 
   },   

   prod: {
      domain: 'https://atecsandbox01.utdallas.edu/polus',
      port_https: 5010,
      hash_secret: '!AT#C4Ev3R!',
      key: './config/.security/key/key.pem',
      cert: './config/.security/cert/cert.pem'
   }
}

let current = typeof( process.env.NODE_ENV ) == "string" ? process.env.NODE_ENV : "",
env = typeof( envs[current] ) == 'object' ? envs[current] : envs.dev

module.exports = env
