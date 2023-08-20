/* eslint-disable new-cap */
import { Client, Partials, Collection, GatewayIntentBits } from 'discord.js'
import Logger from './Logger.js'
import { Command } from '../base/Command.js'
import commandManager from '../helper/commandManager.js'
import eventManager from '../helper/eventManager.js'
import { SlashCommand } from '../base/SlashCommand.js'
import { UniCommand } from '../base/UniCommand.js'
import slashManager from '../helper/slashManager.js'

class Bot extends Client {
  public readonly config = process.env
  public readonly commands: Collection<string, Command>
  public readonly aliases: Collection<string, string>
  public readonly slashCommands: Collection<string, SlashCommand>
  public readonly subCommands: Collection<string, SlashCommand>
  public readonly uniCommands: Collection<string, UniCommand>

  constructor () {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations
      ],
      partials: [
        Partials.User,
        Partials.Message,
        Partials.GuildMember,
        Partials.ThreadMember,
        Partials.Reaction,
        Partials.Channel
      ]
    })

    this.commands = new Collection()
    this.aliases = new Collection()
    this.slashCommands = new Collection()
    this.subCommands = new Collection()
    this.uniCommands = new Collection()
    Logger()
  }

  override async login () {
    await eventManager(this)
    await commandManager(this)
    await slashManager(this)

    return super.login(this.config.TOKEN)
  }
}

export default Bot
