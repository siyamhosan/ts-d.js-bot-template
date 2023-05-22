import { readdir } from 'fs/promises'
import { Command } from '../base/Command.js'
import Bot from '../library/Client.js'
import chalk from 'chalk'
import { TableUserConfig, table } from 'table'

export default async (client: Bot) => {
  console.info(chalk.bold('Loading Prefix Commands...'), chalk.bold('pre'))

  const contents = [['No.', 'Name', 'Category']]
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

  ;(await readdir('./src/main/commands/')).forEach(async dir => {
    const commandFiles = (await readdir(`./src/main/commands/${dir}/`)).filter(
      f => f.endsWith('.ts')
    )
    for (const file of commandFiles) {
      const command: Command = new // eslint-disable-next-line new-cap
      (await import(`../../main/commands/${dir}/${file}`)).default()
      if (command.name) {
        client.commands.set(command.name, command)
        command.aliases.forEach(alias => {
          client.aliases.set(alias, command.name)
        })
        contents.push([
          `${client.commands.size}`,
          command.name,
          command.category
        ])
      }
    }
    table(contents, config)
      .split('\n')
      .forEach(text => {
        console.info(text, chalk.bold('pre'))
      })
  })
}
