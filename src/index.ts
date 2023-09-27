/* eslint-disable @typescript-eslint/ban-ts-comment */
import { exec } from 'child_process'
import 'dotenv/config.js'
import { Bot, Compiler, EventManager } from 'dtscommands'
import { writeFileSync } from 'fs'
import path from 'path'

const bot = new Bot({
  commandsDir: path.join(process.cwd(), 'src', 'main', 'commands'),
  eventsDir: path.join(process.cwd(), 'src', 'main', 'events'),
  prefix: '!',
  uniCommandsDir: path.join(process.cwd(), 'src', 'main', 'uniCommands'),
  slashCommandsDir: path.join(process.cwd(), 'src', 'main', 'slashCommands')
})

CompileManager(bot.config.eventsDir, 'events')
CompileManager(bot.config.commandsDir, 'commands')
CompileManager(bot.config.slashCommandsDir, 'slashCommands')

bot.login().then(() => {
  const watchers = [
    'unhandledRejection',
    'uncaughtException',
    'uncaughtExceptionMonitor'
  ]

  watchers.forEach(str => {
    process.on(str, console.error)
  })
})
export default bot

const DynamicImport = async (path: string) =>
  await import(path).catch(console.error)

async function CompileManager (path: string, of: string) {
  await Compiler(path, of).then(async ({ exportedClasses, file }) => {
    writeFileSync(`./src/main/${of}/bundle/bundled.ts`, file)
    let done = false
    await exec(
      `eslint ./src/main/${of}/bundle/bundled.ts --fix --ext .ts --ext .js`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err)
          return
        }
        console.log(stdout)
        console.log(stderr)
        done = true
      }
    )
    while (!done) {
      await new Promise(resolve => setTimeout(resolve, 100))
      done = true
    }

    const allImports = await DynamicImport(`./main/${of}/bundle/bundled.js`)

    EventManager(bot, exportedClasses, allImports)
  })
}
