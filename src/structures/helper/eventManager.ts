import { readdir, stat } from 'node:fs/promises'
import Bot from '../library/Client.js'
import chalk from 'chalk'
import { TableUserConfig, table } from 'table'
import { Event } from '../base/Event.js'
import { ClientEvents } from 'discord.js'

export default async (client: Bot) => {
  const contents = [['No.', 'Name', 'Nick', 'Once']]
  const config: TableUserConfig = {
    drawHorizontalLine: (lineIndex: number, rowCount: number) => {
      return lineIndex === 1 || lineIndex === 0 || lineIndex === rowCount
    },

    border: {
      topBody: chalk.gray('─'),
      topJoin: chalk.gray('┬'),
      topLeft: chalk.gray('┌'),
      topRight: chalk.gray('┐'),

      bottomBody: chalk.gray('─'),
      bottomJoin: chalk.gray('┴'),
      bottomLeft: chalk.gray('└'),
      bottomRight: chalk.gray('┘'),

      bodyLeft: chalk.gray('│'),
      bodyRight: chalk.gray('│'),
      bodyJoin: chalk.gray('│'),

      joinBody: chalk.gray('─'),
      joinLeft: chalk.gray('├'),
      joinRight: chalk.gray('┤'),
      joinJoin: chalk.gray('┼')
    }
  }

  console.info(chalk.bold('Loading Events...'), chalk.bold('evt'));
  (await readdir('./src/main/events/')).forEach(async dir => {
    const files = (await readdir(`./src/main/events/${dir}/`)).filter(
      f => f.endsWith('.ts')
    )
    let i = 1

    for await (const file of files) {
      if (!(await stat(`src/main/events/${dir}/${file}`)).isFile()) return
      const event: Event<keyof ClientEvents> =
        new // eslint-disable-next-line new-cap
        (await import(`../../main/events/${dir}/${file}`)).default()

      if (event.options.once) {
        client.once(event.options.name, event.run)
      } else {
        client.on(event.options.name, event.run)
      }

      contents.push([
        String(`${i++}.`),
        event.options.name,
        event.options.nick || '(None)',
        event.options.once ? 'Yes' : 'No'
      ])
    }
    table(contents, config)
      .split('\n')
      .forEach(text => {
        console.info(text, chalk.bold('evt'))
      })
  })
}
