import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
  PermissionsBitField,
  SlashCommandBuilder,
  User
} from 'discord.js'
import Bot from '../library/Client.js'
import { CommandOptions } from './Command.js'
import { GuildModel } from '../../schemas/Models.js'

export interface UniCommandRun {
  ctx: ChatInputCommandInteraction | Message
  args: string[]
  client: Bot
  prefix: string
}

export abstract class UniCommand {
  readonly command: CommandOptions
  readonly slash: SlashCommandBuilder

  constructor (command: CommandOptions, slash?: SlashCommandBuilder) {
    this.command = command
    if (slash) {
      slash?.setName(command.name).setDescription(command.description)
      this.slash = slash
    } else {
      this.slash = new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.description)
    }
  }

  public abstract run(options: UniCommandRun): void
}

export async function UniCommandValidator (
  ctx: Message | ChatInputCommandInteraction,
  prefix: string,
  args: string[],
  uniCommand: UniCommand,
  client: Bot
) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const commandUser: User = ctx.author || ctx.user || ctx.member?.user

  const { command } = uniCommand
  if (
    !ctx.guild?.members.me?.permissions.has(
      PermissionsBitField.resolve('SendMessages')
    )
  ) {
    return await commandUser.dmChannel
      ?.send({
        content: `I don't have **\`SEND_MESSAGES\`** permission in <#${ctx.channelId}> to execute this **\`${command.name}\`** command.`
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {})
  }

  if (
    !ctx.guild.members.me.permissions.has(
      PermissionsBitField.resolve('ViewChannel')
    )
  ) {
    return
  }

  if (
    !ctx.guild.members.me.permissions.has(
      PermissionsBitField.resolve('EmbedLinks')
    )
  ) {
    return await ctx.channel
      ?.send({
        content: `I don't have **\`EMBED_LINKS\`** permission in <#${ctx.channelId}> to execute this **\`${command.name}\`** command.`
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {})
  }

  const embed = new EmbedBuilder().setColor('Red')

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${commandUser}!`

    if (command.usage) {
      reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``
    }

    embed.setDescription(reply)
    return ctx.channel?.send({ embeds: [embed] })
  }

  if (command.botPerms) {
    if (
      !ctx.guild.members.me.permissions.has(
        PermissionsBitField.resolve(command.botPerms || [])
      )
    ) {
      embed.setDescription(
        `I don't have **\`${command.botPerms}\`** permission in <#${ctx.channelId}> to execute this **\`${command.name}\`** command.`
      )
      return ctx.channel?.send({ embeds: [embed] })
    }
  }
  if (command.userPerms) {
    if (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !ctx.member?.permissions.has(
        PermissionsBitField.resolve(command.userPerms || [])
      )
    ) {
      embed.setDescription(
        `You don't have **\`${command.userPerms}\`** permission in <#${ctx.channelId}> to execute this **\`${command.name}\`** command.`
      )
      return ctx.channel?.send({ embeds: [embed] })
    }
  }

  if (command.owner && commandUser.id !== `${client.config.OWNER}`) {
    embed.setDescription(`Only <@${client.config.OWNER}> Can Use this Command`)
    return ctx.channel?.send({ embeds: [embed] })
  }

  const guild = await GuildModel.findOne({ GuildId: ctx.guildId })
  if (command.manager && guild) {
    if (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !ctx.member?.permissions.has(PermissionFlagsBits.ManageGuild) ||
      !guild.managers.some((r: string) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ctx.member?.roles.cache.map((r: string) => r.id).includes(r)
      ) ||
      ctx.guild.ownerId !== commandUser.id
    ) {
      embed.setDescription(
        `You don't have **Manager role** in this server to execute this **\`${command.name}\`** command.`
      )
      return ctx.channel?.send({ embeds: [embed] })
    }
  }
}
