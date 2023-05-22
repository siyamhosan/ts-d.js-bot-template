import { Event } from '../../../structures/base/Event.js'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message
} from 'discord.js'
import client from '../../../index.js'
import { CommandValidator } from '../../../structures/base/Command.js'
import chalk from 'chalk'
import { UniCommandValidator } from '../../../structures/base/UniCommand.js'

class Command extends Event<'messageCreate'> {
  constructor () {
    super({
      name: 'messageCreate',
      nick: 'preCommandsDirecter'
    })
  }

  run (message: Message) {
    if (message.author.bot) return
    const prefix = '?'

    const mention = new RegExp(`^<@!?${client.user?.id}>( |)$`)
    if (message.content.match(mention)) {
      const row = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(
            'https://discord.com/api/oauth2/authorize?client_id=990571985048317953&permissions=8&scope=bot%20applications.commands'
          )
          .setLabel('Invite Me'),
        new ButtonBuilder()
          .setURL('https://www.facebook.com/Sahoab.Hosan')
          .setLabel('Get help')
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setURL('https://thetur.xyz/pages/commands.html')
          .setStyle(ButtonStyle.Link)
          .setLabel('Command List')
      ])
      // message.channel.send({ embeds: [botMention], components:[row] });
      message.channel.send({
        content:
          'Siyam Brutha Please Update Koren!!\n`Client/messageCreate.js 43:20`',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        components: [row]
      })
    }
    const escapeRegex = (str: string) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const prefixRegex = new RegExp(
      `^(<@!?${client.user?.id}>|${escapeRegex(prefix)})\\s*`
    )
    if (!prefixRegex.test(message.content)) return

    const [matchedPrefix] = message.content.match(prefixRegex) || ['']

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/)
    const commandName = args.shift()?.toLowerCase() || ''

    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        cmd => cmd.aliases && cmd.aliases.includes(commandName)
      )

    const uniCommand =
      client.uniCommands.get(commandName) ||
      client.uniCommands.find(
        cmd => cmd.command.aliases && cmd.command.aliases.includes(commandName)
      )

    if (command) {
      CommandValidator(message, prefix, args, command, client)

      try {
        command.run({
          message,
          args,
          client,
          prefix
        })
      } catch (err) {
        console.warn(chalk.redBright(err), 'cmd')
        message.reply({
          content: 'There was an error trying to execute that command!'
        })
      }
    } else if (uniCommand) {
      UniCommandValidator(message, prefix, args, uniCommand, client)

      try {
        uniCommand.run({
          ctx: message,
          args,
          client,
          prefix
        })
      } catch (err) {
        console.warn(chalk.redBright(err), 'ucd')
        message.reply({
          content: 'There was an error trying to execute that command!'
        })
      }
    }
  }
}

export default Command
