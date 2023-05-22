import {
  ChatInputCommandInteraction,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  SlashCommandBuilder
} from 'discord.js'
import Bot from '../library/Client.js'
import { GuildModel } from '../../schemas/Models.js'

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
) {
  const guild = await GuildModel.findOne({ guildId: interaction.guildId })
  const embed = new EmbedBuilder().setColor('Red')
  if (cmd.botPerms) {
    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionsBitField.resolve(cmd.botPerms || [])
      )
    ) {
      embed.setDescription(
        `I don't have **\`${
          cmd.botPerms
        }\`** permission in ${interaction.channel?.toString()} to execute this **\`${
          cmd.data?.name || cmd.subCommand
        }\`** command.`
      )
      return interaction.reply({ embeds: [embed] })
    }
  }

  if (cmd.manager && guild && guild.managers.length > 0) {
    if (
      !guild.managers.some(r =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        interaction.member?.roles.cache.map(r => r.id).includes(r)
      ) ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !interaction.member?.permissions.has(PermissionFlagsBits.ManageGuild)
    ) {
      embed.setDescription(
        `You don't have **Manager role** in this server to execute this **\`${
          cmd.data?.name || cmd.subCommand
        }\`** command.`
      )
      return interaction.reply({ embeds: [embed] })
    }
  }
}
