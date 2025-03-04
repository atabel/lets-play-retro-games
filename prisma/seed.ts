import { CONSOLES, Game, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { omit } from 'lodash'
import nesGames from '../data/games/nes/all.json'
import snesGames from '../data/games/snes/all.json'
import gbGames from '../data/games/gb/all.json'
import gbaGames from '../data/games/gba/all.json'
import gbcGames from '../data/games/gbc/all.json'
import n64Games from '../data/games/n64/all.json'
import mdGames from '../data/games/md/all.json'

const defaultValues = {
  alternative_names: [],
  cover: {},
  first_release_date: null,
  franchise: {},
  genres: [],
  involved_companies: [],
  screenshots: [],
  storyline: '',
  summary: '',
  total_rating_count: null,
  total_rating: null,
  videos: [],
}

const createGames = async (
  games: Omit<Game, 'console'>[],
  platform: CONSOLES
) => {
  const all = games.map(async (game) => {
    const gameInDb = await prisma.game.findFirst({
      where: {
        igdb_id: game.id,
        console: platform,
      },
    })

    if (gameInDb?.name) return
    await prisma.game.create({
      // @ts-ignore
      data: {
        ...defaultValues,
        ...omit(game, 'id'),
        // @ts-ignore
        igdb_id: game.id,
        console: platform,
      },
    })
  })

  await Promise.all(all)
}

async function main() {
  // @ts-ignore
  await createGames(nesGames, 'nes')
  // @ts-ignore
  await createGames(snesGames, 'snes')
  // @ts-ignore
  await createGames(gbGames, 'gb')
  // @ts-ignore
  await createGames(gbaGames, 'gba')
  // @ts-ignore
  await createGames(gbcGames, 'gbc')
  // @ts-ignore
  await createGames(n64Games, 'n64')
  // @ts-ignore
  await createGames(mdGames, 'md')
}

main()
  .then(prisma.$disconnect)
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
