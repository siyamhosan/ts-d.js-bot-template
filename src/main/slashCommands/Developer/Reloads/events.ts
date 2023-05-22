import {
  SlashCommand,
  SlashCommandRun
} from '../../../../structures/base/SlashCommand.js'
import chalk from 'chalk'
import eventManager from '../../../../structures/helper/eventManager.js'

class PingCmd extends SlashCommand {
  constructor () {
    super({
      subCommand: 'events'
    })
  }

  async run ({ interaction, client }: SlashCommandRun) {
    if (client.config.DEV_GUILD !== interaction.guildId) {
      await interaction.reply({
        content: 'Not Available...',
        ephemeral: true
      })
      return
    }

    await interaction.reply({
      content: 'Reloading Events...',
      ephemeral: true
    })

    console.info('Reloading Events...', chalk.bold('cli'))
    await eventManager(client)

    await interaction.editReply({
      content: 'Reloaded Events Successfully!'
    })
  }
}

export default PingCmd
