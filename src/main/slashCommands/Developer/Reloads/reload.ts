import { SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../../../../structures/base/SlashCommand.js'

class ReloadHub extends SlashCommand {
  constructor () {
    super({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads main command!')
        .addSubcommand(subcommand =>
          subcommand.setName('events').setDescription('Reloads events!')
        )
        .addSubcommand(subcommand =>
          subcommand.setName('commands').setDescription('Reloads commands!')
        )
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public run () {}
}

export default ReloadHub
