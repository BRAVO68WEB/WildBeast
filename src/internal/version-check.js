const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

exec('git remote update').then(gitVerify).catch(async () => {
  logger.warn('V-CHECK', 'Git commit checking failed, falling back to version checking')
  const SA = require('superagent')
  const local = require('../../package.json').version
  const stable = await SA.get('https://raw.githubusercontent.com/TheSharks/WildBeast/master/package.json')
  const exp = await SA.get('https://raw.githubusercontent.com/TheSharks/WildBeast/experimental/package.json')
  logger.log('V-CHECK', `Latest stable version: ${JSON.parse(stable.text).version}. Latest experimental version: ${JSON.parse(exp.text).version}`)
  if (local !== JSON.parse(stable.text).version && local !== JSON.parse(exp.text).version) {
    logger.warn('V-CHECK', 'Not up-to-date with any remote version, update recommended')
  }
})

async function gitVerify () {
  const currentHead = await exec('git rev-parse --abbrev-ref HEAD')
  const remoteRef = await exec(`git rev-parse origin/${currentHead.stdout.trim()}`)
  const currentRef = await exec('git rev-parse HEAD')
  const count = await exec(`git rev-list ${currentRef.stdout.trim()}..${remoteRef.stdout.trim()} --count`)
  if (count.stdout.trim() > 0) logger.warn('V-CHECK', `You're behind ${count.stdout.trim()} commit(s) compared to remote branch ${currentHead.stdout.trim()}, update recommended`)
  else logger.log('V-CHECK', 'Fully up-to-date, nice!')
}
