import {
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
  PermissionsBitField
} from 'discord.js'
import Bot from '../library/Client.js'
import { GuildModel } from '../../schemas/Models.js'

export interface CommandRun {
  message: Message
  args: string[]
  client: Bot
  prefix: string
}

export interface CommandOptions {
  name: string
  category: string
  description: string
  args?: boolean
  usage?: string
  aliases?: string[]
  userPerms?: PermissionsBitField[]
  botPerms?: PermissionsBitField[]
  owner?: boolean
  manager?: boolean
  beta?: boolean
}

export abstract class Command {
  readonly name: string
  readonly category: string
  readonly description: string
  readonly args: boolean
  readonly usage: string
  readonly aliases: string[]
  readonly userPerms: PermissionsBitField[]
  readonly botPerms: PermissionsBitField[]
  readonly owner: boolean
  readonly manager: boolean
  readonly beta: boolean

  constructor (options: CommandOptions) {
    this.name = options.name
    this.category = options.category
    this.description = options.description
    this.args = options.args || false
    this.usage = options.usage || ''
    this.aliases = options.aliases || []
    this.userPerms = options.userPerms || []
    this.botPerms = options.botPerms || []
    this.owner = options.owner || false
    this.manager = options.manager || false
    this.beta = options.beta || false
  }

  public abstract run(options: CommandRun): void
}

export async function CommandValidator (
  message: Message,
  prefix: string,
  args: string[],
  command: Command,
  client: Bot
) {
  if (
    !message.guild?.members.me?.permissions.has(
      PermissionsBitField.resolve('SendMessages')
    )
  ) {
    return await message.author.dmChannel
      ?.send({
        content: `I don't have **\`SEND_MESSAGES\`** permission in <#${message.channelId}> to execute this **\`${command.name}\`** command.`
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {})
  }

  if (
    !message.guild.members.me.permissions.has(
      PermissionsBitField.resolve('ViewChannel')
    )
  ) {
    return
  }

  if (
    !message.guild.members.me.permissions.has(
      PermissionsBitField.resolve('EmbedLinks')
    )
  ) {
    return await message.channel
      .send({
        content: `I don't have **\`EMBED_LINKS\`** permission in <#${message.channelId}> to execute this **\`${command.name}\`** command.`
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {})
  }

  const embed = new EmbedBuilder().setColor('Red')

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`

    if (command.usage) {
      reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``
    }

    embed.setDescription(reply)
    return message.channel.send({ embeds: [embed] })
  }

  if (command.botPerms) {
    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve(command.botPerms || [])
      )
    ) {
      embed.setDescription(
        `I don't have **\`${command.botPerms}\`** permission in <#${message.channelId}> to execute this **\`${command.name}\`** command.`
      )
      return message.channel.send({ embeds: [embed] })
    }
  }
  if (command.userPerms) {
    if (
      !message.member?.permissions.has(
        PermissionsBitField.resolve(command.userPerms || [])
      )
    ) {
      embed.setDescription(
        `You don't have **\`${command.userPerms}\`** permission in <#${message.channelId}> to execute this **\`${command.name}\`** command.`
      )
      return message.channel.send({ embeds: [embed] })
    }
  }

  if (command.owner && message.author.id !== `${client.config.OWNER}`) {
    embed.setDescription(`Only <@${client.config.OWNER}> Can Use this Command`)
    return message.channel.send({ embeds: [embed] })
  }

  const guild = await GuildModel.findOne({ GuildId: message.guildId })
  if (command.manager && guild) {
    if (
      !message.member?.permissions.has(PermissionFlagsBits.ManageGuild) ||
      !guild.managers.some((r: string) =>
        message.member?.roles.cache.map(r => r.id).includes(r)
      ) ||
      message.guild.ownerId !== message.author.id
    ) {
      embed.setDescription(
        `You don't have **Manager role** in this server to execute this **\`${command.name}\`** command.`
      )
      return message.channel.send({ embeds: [embed] })
    }
  }
}
