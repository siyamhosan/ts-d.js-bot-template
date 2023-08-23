import { EmbedBuilder } from 'discord.js'
import {
  UniCommand,
  UniCommandRun
} from '../../../structures/base/UniCommand.js'

export class InfoUni extends UniCommand {
  constructor () {
    super({
      name: 'info',
      category: 'Client',
      description: 'Shows info about the client!'
    })
  }

  async run ({ ctx, client }: UniCommandRun) {
    const msg = await ctx.reply({
      content: 'Pinging...'
    })

    const ping = msg.createdTimestamp - ctx.createdTimestamp
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
