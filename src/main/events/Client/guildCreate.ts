import { Guild } from 'discord.js'
import { Event } from '../../../structures/base/Event.js'
import prisma from '../../../prisma.js'

export class GuildJoinEvent extends Event<'guildCreate'> {
  constructor () {
    super({
      name: 'guildCreate',
      nick: 'guildJoin'
    })
  }

  async run (guild: Guild) {
    await prisma.guild.create({
      data: {
        guildId: guild.id
      }
    })
  }
}
