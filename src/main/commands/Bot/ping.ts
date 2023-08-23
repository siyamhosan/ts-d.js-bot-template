import { EmbedBuilder } from 'discord.js'
import { Command, CommandRun } from '../../../structures/base/Command.js'

export class PingCmd extends Command {
  constructor () {
    super({
      name: 'ping',
      category: 'Bot',
      description: 'Pong!'
    })
  }

  async run ({ message, client }: CommandRun) {
    const msg = await message.reply({
      content: 'Pinging...'
    })

    const ping = msg.createdTimestamp - message.createdTimestamp
    const apiPing = Math.round(client.ws.ping)

    msg.edit({
      embeds: [
        new EmbedBuilder()
          .setColor('DarkButNotBlack')
          .setTitle('Pong!')
          .setDescription(
            `> Latency: \`${ping}\`ms\n> API Latency: \`${apiPing}\`ms`
          )
          .setTimestamp()
      ],
      content: ''
    })
  }
}
