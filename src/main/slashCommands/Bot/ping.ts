import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { SlashCommand, SlashCommandRun } from '../../../structures/base/SlashCommand.js'
class PingCmd extends SlashCommand {
  constructor () {
    super({
      data: new SlashCommandBuilder().setName('ping').setDescription('Pong!')
    })
  }

  async run ({ interaction, client }: SlashCommandRun) {
    const msg = await interaction.reply({
      content: 'Pinging...',
      ephemeral: true,
      fetchReply: true
    })

    const ping = msg.createdTimestamp - interaction.createdTimestamp
    const apiPing = Math.round(client.ws.ping)

    interaction.editReply({
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

export default PingCmd
