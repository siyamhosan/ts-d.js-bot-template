/* eslint-disable new-cap */
import { Client, Partials, Collection, GatewayIntentBits } from 'discord.js'
import Logger from './Logger.js'
import { Command } from '../base/Command.js'
import commandManager from '../helper/commandManager.js'
import eventManager from '../helper/eventManager.js'
import { SlashCommand } from '../base/SlashCommand.js'
import { UniCommand } from '../base/UniCommand.js'
import slashManager from '../helper/slashManager.js'
import { Worker } from 'worker_threads'
import { readFileSync, watchFile } from 'fs'
import { Compiler } from '../helper/compiler.js'
import { Level } from '../base/Levels.js'

class Bot extends Client {
  public readonly config = process.env
  public readonly commands: Collection<string, Command>
  public readonly aliases: Collection<string, string>
  public readonly slashCommands: Collection<string, SlashCommand>
  public readonly subCommands: Collection<string, SlashCommand>
  public readonly uniCommands: Collection<string, UniCommand>
  public readonly level = new Level({})

  constructor () {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
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
    this.level = new Level({})
    Logger()
  }

  private async compiler () {
    const cmds = ['events', 'commands', 'uniCommands', 'slashCommands']

    console.debug('Compiling...')

    let done = 0
    for (const cmd of cmds) {
      const worker = new Worker('./src/structures/helper/compiler.ts')
      worker.postMessage(cmd)
      worker.on('message', () => {
        done++
      })
    }

    while (done < cmds.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.debug('Compiled!')
  }

  public async reloadEvents () {
    this.removeAllListeners()
    await Compiler('events')
    await eventManager(this)
  }

  public async reloadCommands () {
    this.commands.clear()
    await Compiler('commands')
    await commandManager(this)
  }

  public async reloadSlash () {
    this.slashCommands.clear()
    this.uniCommands.clear()
    this.subCommands.clear()
    await Compiler('slashCommands')
    await slashManager(this)
  }

  public async watcher () {
    const eventFiles =
      JSON.parse(
        readFileSync('./src/main/events/bundle/events-compiled.json', 'utf-8')
      ).filesPaths || []
    const CommandFiles =
      JSON.parse(
        readFileSync(
          './src/main/commands/bundle/commands-compiled.json',
          'utf-8'
        )
      ).filesPaths || []
    const SlashFiles =
      JSON.parse(
        readFileSync(
          './src/main/slashCommands/bundle/slashCommands-compiled.json',
          'utf-8'
        )
      ).filesPaths || []

    const UniFiles =
      JSON.parse(
        readFileSync(
          './src/main/uniCommands/bundle/uniCommands-compiled.json',
          'utf-8'
        )
      ).filesPaths || []

    for (const file of eventFiles) {
      watchFile(file, async () => {
        console.warn('Reloading Events - on Change')
        await this.reloadEvents()
      })
    }

    for (const file of CommandFiles) {
      watchFile(file, async () => {
        console.warn('Reloading Commands - on Change')
        await this.reloadCommands()
      })
    }

    for (const file of SlashFiles) {
      watchFile(file, async () => {
        console.warn('Reloading Slash Commands - on Change')
        await this.reloadSlash()
      })
    }

    for (const file of UniFiles) {
      watchFile(file, async () => {
        console.warn('Reloading Uni Commands - on Change')
        await this.reloadSlash()
      })
    }
  }

  override async login () {
    const startUp = Date.now()

    await this.compiler()
    await eventManager(this)
    await commandManager(this)
    await slashManager(this)

    if (this.config.MONITOR === 'true') {
      console.warn('Monitoring is enabled')
      this.watcher()
    }

    console.trace(startUp, 'Client Started in', 'BOT')
    return super.login(this.config.TOKEN)
  }
}

export default Bot
