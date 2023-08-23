import { Interaction } from 'discord.js'
import { Event } from '../../../structures/base/Event.js'
import { SlashCommandValidator } from '../../../structures/base/SlashCommand.js'
import client from '../../../index.js'
import { UniCommandValidator } from '../../../structures/base/UniCommand.js'

export class InteractionCommandEvent extends Event<'interactionCreate'> {
  constructor () {
    super({
      name: 'interactionCreate',
      nick: 'SlashCommandsDirecter'
    })
  }

  run (interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return
    const slashCommand = client.slashCommands.get(interaction.commandName)
    const subCommand = interaction.options.getSubcommand(false)
    const uniCommand = client.uniCommands.get(interaction.commandName)
    if (slashCommand) {
      SlashCommandValidator(interaction, slashCommand)

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        slashCommand.run({
          interaction,
          client
        })
      } catch (err) {
        console.error(err)
        if (interaction.replied) {
          return interaction.editReply({
            content: 'There was an error while executing this command!'
          })
        }
        interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        })
      }
    } else if (subCommand) {
      const subCommandFile = client.subCommands.get(subCommand)
      if (!subCommandFile) {
        return interaction.reply({
          content: ' This sub command is outdated.',
          ephemeral: true
        })
      }
      SlashCommandValidator(interaction, subCommandFile)

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        subCommandFile.run({
          interaction,
          client
        })
      } catch (err) {
        console.error(err)
        if (interaction.replied) {
          return interaction.editReply({
            content: 'There was an error while executing this command!'
          })
        }
        interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        })
      }
    } else if (uniCommand) {
      UniCommandValidator(interaction, '?', [], uniCommand, client)

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        uniCommand.run({
          ctx: interaction,
          client
        })
      } catch (err) {
        console.error(err)
        if (interaction.replied) {
          return interaction.editReply({
            content: 'There was an error while executing this command!'
          })
        }
        interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        })
      }
    }
  }
}
