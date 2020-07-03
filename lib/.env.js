const envs = {
   dev: {
      domain: 'localhost',
      port_http: 4010,
      port_https: 5010,
      hash_secret: '!AT#C4Ev3R!',
      key_name: 'local_key.pem',
      cert_name: 'local_cert.pem' 
   },

   prod: {
      domain: 'atecsandbox01.utdallas.edu/polus',
      port_http: 4000,
      port_https: 5000,
      hash_secret: '!AT#C4Ev3R!',
      key_name: 'key.pem',
      cert_name: 'cert.pem'
   }
}

let current = typeof( process.env.NODE_ENV ) == "string" ? process.env.NODE_ENV : "",
env = typeof( envs[current] ) == 'object' ? envs[current] : envs.dev

module.exports = env