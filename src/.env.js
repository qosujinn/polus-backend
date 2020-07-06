const envs = {
   localdev: {
      domain: 'localhost',
      port_http: 9000,
      port_https: 9010,
      hash_secret: '!AT#C4Ev3R!',
      key_name: 'local_key.pem',
      cert_name: 'local_cert.pem' 
   },

   dev: {
      domain: 'atecsandbox01.utdallas.edu/polus',
      port_https: 4010,
      hash_secret: '!AT#C4Ev3R!',
      key_name: 'dev_key.pem',
      cert_name: 'dev_cert.pem' 
   },   

   prod: {
      domain: 'atecsandbox01.utdallas.edu/polus',
      port_https: 5010,
      hash_secret: '!AT#C4Ev3R!',
      key_name: 'key.pem',
      cert_name: 'cert.pem'
   }
}

let current = typeof( process.env.NODE_ENV ) == "string" ? process.env.NODE_ENV : "",
env = typeof( envs[current] ) == 'object' ? envs[current] : envs.dev

module.exports = env