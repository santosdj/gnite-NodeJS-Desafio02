import fastify from 'fastify'
import { knex } from './database'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.get('/hello', async () => {
  const tables = await knex('users').select('*')

  return tables
})

app.get('/hellomeals', async () => {
  const tables = await knex('meals').select('*')

  return tables
})
app.register(usersRoutes, { prefix: 'users' })
app.register(mealsRoutes, { prefix: 'meals' })
