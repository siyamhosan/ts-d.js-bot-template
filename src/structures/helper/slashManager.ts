import { readdir, stat } from 'node:fs/promises'
import Bot from '../library/Client.js'
import chalk from 'chalk'
import { TableUserConfig, table } from 'table'
import { SlashCommand } from '../base/SlashCommand.js'
import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import { UniCommand } from '../base/UniCommand.js'

export default async (client: Bot) => {
  const contents = [['No.', 'Name', 'Type']]
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

  console.info(chalk.bold('Loading Slash Commands...'), chalk.bold('sla'))
  let i = 1
  const data: SlashCommandBuilder[] = []
  ;(await readdir('./src/main/slashCommands/')).forEach(async dir => {
    const files = (await readdir(`./src/main/slashCommands/${dir}/`)).filter(
      f => f.endsWith('.ts')
    )

    for await (const file of files) {
      if ((await stat(`src/main/slashCommands/${dir}/${file}`)).isDirectory()) {
        const slashCommand: SlashCommand =
          new // eslint-disable-next-line new-cap
          (await import(`../../main/slashCommands/${dir}/${file}`)).default()

        if (slashCommand.subCommand) {
          return client.subCommands.set(slashCommand.subCommand, slashCommand)
        }

        client.slashCommands.set(
          slashCommand.data?.name || 'default',
          slashCommand
        )

        if (slashCommand.data) data.push(slashCommand.data)
      } else {
        const slashCommand: SlashCommand =
          new // eslint-disable-next-line new-cap
          (await import(`../../main/slashCommands/${dir}/${file}`)).default()
        if (slashCommand.subCommand) {
          return client.subCommands.set(slashCommand.subCommand, slashCommand)
        }

        client.slashCommands.set(
          slashCommand.data?.name || 'default',
          slashCommand
        )

        if (slashCommand.data) data.push(slashCommand.data)
        contents.push([
          String(`${i++}.`),
          slashCommand.data?.name || 'default',
          'Slash'
        ])
      }
    }
  })
  ;(await readdir('./src/main/uniCommands/')).forEach(async dir => {
    const files = (await readdir(`./src/main/uniCommands/${dir}/`)).filter(f =>
      f.endsWith('.ts')
    )
    for await (const file of files) {
      const slashCommand: UniCommand = new // eslint-disable-next-line new-cap
      (await import(`../../main/uniCommands/${dir}/${file}`)).default()
      client.uniCommands.set(slashCommand.slash.name, slashCommand)

      data.push(slashCommand.slash)

      contents.push([String(`${i++}.`), slashCommand.slash.name, 'Uni'])
    }
    await table(contents, config)
      .split('\n')
      .forEach(text => {
        console.info(text, chalk.bold('sla'))
      })

    const rest = new REST({ version: '10' }).setToken(client.config.TOKEN || '')
    ;(async () => {
      try {
        console.info('Started refreshing application (/) commands.', 'cmd')
        await rest.put(
          Routes.applicationCommands(client.config.clientID || '000'),
          {
            body: data
          }
        )
        console.info('Successfully reloaded application (/) commands.', 'cmd')
      } catch (error) {
        console.error(error)
      }
    })()
  })
}
