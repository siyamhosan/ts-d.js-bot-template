/* eslint-disable new-cap */
import { Client, Partials, Collection, GatewayIntentBits } from 'discord.js'
import Logger from './Logger.js'
import { Command } from '../base/Command.js'
import commandManager from '../helper/commandManager.js'
import eventManager from '../helper/eventManager.js'
import { SlashCommand } from '../base/SlashCommand.js'
import { UniCommand } from '../base/UniCommand.js'
import slashManager from '../helper/slashManager.js'
import mongoose from 'mongoose'
import chalk from 'chalk'

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

    this.config.MONGOURL = process.env.MONGOURL || 'sdasdasdasdasdasdasdasdasd'

    /**
     *  Mongose for data base
     */
    const dbOptions = {
      useNewUrlParser: true,
      autoIndex: false,
      connectTimeoutMS: 10000,
      family: 4,
      useUnifiedTopology: true
    }
    mongoose.connect(this.config.MONGOURL, dbOptions)
    mongoose.Promise = global.Promise
    mongoose.set('strictQuery', false)
    mongoose.connection.on('connected', () => {
      console.info(
        chalk.greenBright('[DB] DATABASE CONNECTED'),
        chalk.bold('DBr')
      )
    })
    mongoose.connection.on('err', err => {
      console.warn(`Mongoose connection error: \n ${err.stack}`, 'error')
    })
    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected', 'DB')
    })
  }

  override async login () {
    await eventManager(this)
    await commandManager(this)
    await slashManager(this)

    return super.login(this.config.TOKEN)
  }
}

export default Bot
