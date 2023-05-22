/* eslint-disable new-cap */
import { Client, Partials, Collection } from 'discord.js'
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
      intents: 131071,
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
    // await this.loadEvents()
    await commandManager(this)
    // await this.loadSlashes()
    await slashManager(this)

    return super.login(this.config.TOKEN)
  }

  // public async loadSlashes () {
  //   const contents = [['No.', 'Name']]
  //   const config: TableUserConfig = {
  //     drawHorizontalLine: (lineIndex: number, rowCount: number) => {
  //       return lineIndex === 1 || lineIndex === 0 || lineIndex === rowCount
  //     },

  //     border: {
  //       topBody: chalk.gray('─'),
  //       topJoin: chalk.gray('┬'),
  //       topLeft: chalk.gray('┌'),
  //       topRight: chalk.gray('┐'),

  //       bottomBody: chalk.gray('─'),
  //       bottomJoin: chalk.gray('┴'),
  //       bottomLeft: chalk.gray('└'),
  //       bottomRight: chalk.gray('┘'),

  //       bodyLeft: chalk.gray('│'),
  //       bodyRight: chalk.gray('│'),
  //       bodyJoin: chalk.gray('│'),

  //       joinBody: chalk.gray('─'),
  //       joinLeft: chalk.gray('├'),
  //       joinRight: chalk.gray('┤'),
  //       joinJoin: chalk.gray('┼')
  //     }
  //   }

  // console.info(chalk.bold('Loading Slash Commands'), chalk.bold('cmd'))
  // if ((await stat('src/main/commands')).isDirectory()) {
  //   const files = await readdir('./src/main/commands')
  //   let i = 1
  //   for await (const file of files) {
  //     if ((await stat(`src/main/commands/${file}`)).isFile()) {
  //       const cmd: Command = new (
  //         await import(`../../main/commands/${file}`)
  //       ).default()

  //       this.commands.array.push(cmd.options)
  //       this.commands.collection.set(cmd.options.name, cmd)
  //       contents.push([String(`${i++}.`), cmd.options.name])
  //     } else {
  //       const cmd: ChatInputApplicationCommandData = {
  //         name: file.toLowerCase(),
  //         description: 'No description provided',
  //         options: []
  //       }

  //       for await (const nFile of await readdir(
  //         `src/main/commands/${file}`
  //       )) {
  //         if ((await stat(`src/main/commands/${file}/${nFile}`)).isFile()) {
  //           const nCmd: Subcommand = new (
  //             await import(`../../main/commands/${file}/${nFile}`)
  //           ).default()

  //           cmd.options?.push({
  //             ...nCmd.options,
  //             type: ApplicationCommandOptionType.Subcommand
  //           })
  //           this.commands.collection.set(
  //             `${cmd.name}/${nCmd.options.name}`,
  //             nCmd
  //           )
  //           contents.push([
  //             String(`${i++}.`),
  //             `${cmd.name}/${nCmd.options.name}`
  //           ])
  //         } else {
  //           const nCmd: ApplicationCommandSubGroupData = {
  //             name: nFile.toLowerCase(),
  //             description: 'No description provided',
  //             type: ApplicationCommandOptionType.SubcommandGroup,
  //             options: []
  //           }

  //           for await (const nnFile of await readdir(
  //             `src/main/commands/${file}/${nFile}`
  //           )) {
  //             const nnCmd: Subcommand = new (
  //               await import(`../../main/commands/${file}/${nFile}/${nnFile}`)
  //             ).default()

  //             nCmd.options?.push({
  //               ...nnCmd.options,
  //               type: ApplicationCommandOptionType.Subcommand
  //             })
  //             this.commands.collection.set(
  //               `${cmd.name}/${nCmd.name}/${nnCmd.options.name}`,
  //               nnCmd
  //             )
  //             contents.push([
  //               String(`${i++}.`),
  //               `${cmd.name}/${nCmd.name}/${nnCmd.options.name}`
  //             ])
  //           }

  //           cmd.options?.push(nCmd)
  //         }
  //       }

  //       this.commands.array.push(cmd)
  //       table(contents, config)
  //         .split('\n')
  //         .forEach(c => {
  //           console.info(c, chalk.bold('cmd'))
  //         })
  //     }
  //   }
  // }
  // }
}

export default Bot
