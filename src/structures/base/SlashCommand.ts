/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Colors,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder
} from 'discord.js'
import Bot from '../library/Client.js'

export interface SlashCommandRun {
  interaction: CommandInteraction
  options: Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>
  client: Bot
}

export interface SlashCommandOptions {
  data?: SlashCommandBuilder | undefined
  subCommand?: string | undefined
  manager?: boolean
  botPerms?: PermissionsBitField[]
  beta?: boolean
}

export abstract class SlashCommand {
  readonly data: SlashCommandBuilder | undefined
  readonly subCommand: string | undefined
  readonly manager: boolean
  readonly botPerms: PermissionsBitField[]
  readonly beta: boolean

  constructor (options: SlashCommandOptions) {
    this.data = options.data || undefined
    this.subCommand = options.subCommand || undefined
    this.manager = options.manager || false
    this.botPerms = options.botPerms || []
    this.beta = options.beta || false
  }

  public abstract run?(options: SlashCommandRun): void
}

export async function SlashCommandValidator (
  interaction: ChatInputCommandInteraction,
  cmd: SlashCommand
): Promise<boolean> {
  const embed = new EmbedBuilder().setColor(Colors.Red)
  if (cmd.botPerms) {
    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionsBitField.resolve(cmd.botPerms || [])
      )
    ) {
      embed
        .setDescription(
          `I don't have **\`${cmd.botPerms
            .map(perm => perm)
            .join(
              ', '
            )}\`** permission in ${interaction.channel?.toString()} to execute this **\`${
            cmd.data?.name || cmd.subCommand
          }\`** command.`
        )
        .setTitle('Missing Permissions')
      const fixPermissionsButton = new ButtonBuilder()
        .setLabel('Fix Permissions')
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&scope=bot%20applications.commands&permissions=382185367609&guild_id=${interaction.guild?.id}&disable_guild_select=true`
        )
      if (interaction.replied) {
        interaction.editReply({
          embeds: [embed],
          components: [
            // @ts-ignore
            new ActionRowBuilder().addComponents(fixPermissionsButton)
          ]
        })
        return true
      } else {
        interaction.reply({
          embeds: [embed],
          components: [
            // @ts-ignore
            new ActionRowBuilder().addComponents(fixPermissionsButton)
          ]
        })
        return true
      }
    }
  }

  return false
}
