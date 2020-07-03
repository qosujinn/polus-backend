const envs = {
   dev: {
      port_http: 4010,
      port_https: 5010,
      hash_secret: '!AT#C4Ev3R!'
   },

   prod: {
      port_http: 4000,
      port_https: 5000,
      hash_secret: '!AT#C4Ev3R!'
   }
}

let current = typeof( process.env.NODE_ENV ) == "string" ? process.env.NODE_ENV : "",
env = typeof( envs[current] ) == 'object' ? envs[current] : envs.dev

module.exports = env