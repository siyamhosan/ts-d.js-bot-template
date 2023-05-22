import { SlashCommand, SlashCommandRun } from '../../../../structures/base/SlashCommand'
import chalk from 'chalk'
import slashManager from '../../../../structures/helper/slashManager'

class PingCmd extends SlashCommand {
  constructor () {
    super({
      subCommand: 'commands'
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
      content: 'Reloading Commands...',
      ephemeral: true
    })

    console.info('Reloading Commands...', chalk.bold('cli'))
    await slashManager(client)

    await interaction.editReply({
      content: 'Reloaded Commands Successfully!'
    })
  }
}

export default PingCmd
