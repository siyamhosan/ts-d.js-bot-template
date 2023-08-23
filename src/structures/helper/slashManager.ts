/* eslint-disable @typescript-eslint/no-explicit-any */
import Bot from '../library/Client.js'
import chalk from 'chalk'
import { TableUserConfig, table } from 'table'
import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import { readFileSync } from 'node:fs'

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

  const startTime = Date.now()

  console.info(
    chalk.bold('Loading Slash And Uni Commands...'),
    chalk.bold('sla')
  )

  const { exportedClasses } = JSON.parse(
    readFileSync(
      './src/main/slashCommands/bundle/slashCommands-compiled.json',
      'utf-8'
    )
  )

  if (!exportedClasses) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allSlashCommands: Record<string, any> = await import(
    '../../main/slashCommands/bundle/slashCommands-bundled.js'
  )

  let i = 1
  const data: SlashCommandBuilder[] = []
  for (const slash of exportedClasses) {
    const SlashClass = allSlashCommands[slash]
    const slashInstance = new SlashClass(client)

    if (slashInstance.subCommand) {
      return client.subCommands.set(slashInstance.subCommand, slashInstance)
    }

    client.slashCommands.set(
      slashInstance.data?.name || 'default',
      slashInstance
    )

    if (slashInstance.data) data.push(slashInstance.data)

    contents.push([
      String(`${i++}.`),
      slashInstance.data?.name || 'default',
      'Slash'
    ])
  }

  i = 1

  const allUniCommands: Record<string, any> = await import(
    '../../main/uniCommands/bundle/uniCommands-bundled.js'
  )
  const uniBundle = JSON.parse(
    readFileSync(
      './src/main/uniCommands/bundle/uniCommands-compiled.json',
      'utf-8'
    )
  )

  const uniClasses = uniBundle.exportedClasses

  for (const uni of uniClasses) {
    const UniClass = allUniCommands[uni]
    const uniInstance = new UniClass(client)

    client.uniCommands.set(uniInstance.slash.name, uniInstance)
    data.push(uniInstance.slash)

    contents.push([String(`${i++}.`), uniInstance.slash.name, 'Uni'])
  }

  await table(contents, config)
    .split('\n')
    .forEach(text => {
      console.info(text, chalk.bold('sla'))
    })

  console.trace(
    startTime,
    chalk.bold('Loaded Slash And Uni Commands In '),
    chalk.bold('sla')
  )

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
}
