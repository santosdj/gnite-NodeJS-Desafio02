import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function usersRoutes(app: FastifyInstance) {
  const getUserParamSchema = z.object({
    id: z.string().uuid(),
  })

  app.get('/', async () => {
    const user = await knex('users').select()
    return { user }
  })

  app.get('/:id', async (request, reply) => {
    const { id } = getUserParamSchema.parse(request.params)
    const user = await knex('users').where('id', id).first()

    reply.cookie('user_id', id, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    return { user }
  })

  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      birthday: z.coerce.date(),
      email: z.string(),
      phone: z.string(),
      avatar: z.string(),
    })

    const { name, birthday, email, phone, avatar } = createUserSchema.parse(
      request.body,
    )

    const id = randomUUID()
    await knex('users').insert({
      id,
      name,
      birthday,
      email,
      phone,
      avatar,
    })

    reply.cookie('user_id', id, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    reply.status(201).send()
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = getUserParamSchema.parse(request.params)
    console.log('id=', id)

    await knex('users').where('id', id).delete()

    reply.status(204).send()
  })
}
