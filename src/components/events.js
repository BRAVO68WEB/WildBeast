/**
 * Indexer for all events the program should listen for
 * All events are located in /src/events, and can be multiple directories deep
 */

const glob = require('glob')
const events = glob.sync('src/events/**/*.js')
const path = require('path')
const indexed = events.map(x => x.split('/').splice(2))
const final = {}

try {
  indexed.forEach(contents => {
    contents[0] = path.basename(contents[0], '.js') // remove the .js suffix if there is any
    if (!final[contents[0]]) final[contents[0]] = [] // secure there's an array, we do this so the array can be expanded safely later on
    final[contents[0]] = [
      ...final[contents[0]], // expand previous events into the new array
      require(path.normalize(`${process.cwd()}/src/events/${contents.join('/')}`)) // expand new events into the array
    ]
  })
} catch (e) {
  logger.error(e, true)
}

logger.trace('EVENTS', final)
module.exports = final
