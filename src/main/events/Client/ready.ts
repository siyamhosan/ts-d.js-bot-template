import { Event } from '../../../structures/base/Event.js'
import bot from '../../../index.js'
import chalk from 'chalk'

class ReadyEvent extends Event<'ready'> {
  constructor () {
    super({
      name: 'ready',
      once: true
    })
  }

  run () {
    console.info(`Client logged in as "${bot.user?.tag}"`, chalk.bold('cli'))
    // bot.application?.commands.set(bot.commands.array)
  }
}

export default ReadyEvent
