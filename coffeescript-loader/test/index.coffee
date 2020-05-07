import { scream } from './esm/scream.coffee'
console.log scream 'I said, hello'

import { version } from 'process'
console.log "Brought to you by Node.js version #{version}"

# import shoutDefault from './cjs/shout.coffee'
# console.log shoutDefault
# { shout } = shoutDefault
# console.log shout 'hello'
