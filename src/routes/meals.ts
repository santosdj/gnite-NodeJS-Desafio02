/* eslint-disable camelcase */
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkUserIdExists } from '../middlewares/check_user_id_exists'

export async function mealsRoutes(app: FastifyInstance) {
  const getMealIdSchema = z.object({ id: z.string().uuid() })

  app.addHook('preHandler', checkUserIdExists)

  app.post('/', async (request, reply) => {
    const { user_id } = request.cookies
    const createMealSchema = z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      is_on_diet: z.coerce.boolean(),
    })

    const { title, description, date, is_on_diet } = createMealSchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      user_id,
      title,
      description,
      date,
      is_on_diet,
    })
    reply.status(201).send()
  })

  app.put('/:id', async (request, reply) => {
    const updateMealSchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      date: z.coerce.date().optional(),
      is_on_diet: z.coerce.boolean().optional(),
    })
    const { user_id } = request.cookies

    const { id } = getMealIdSchema.parse(request.params)
    const { title, description, date, is_on_diet } = updateMealSchema.parse(
      request.body,
    )

    await knex('meals').where({ id, user_id }).update({
      title,
      description,
      date,
      is_on_diet,
    })

    return reply.status(204).send()
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = getMealIdSchema.parse(request.params)
    const { user_id } = request.cookies
    const count = await knex('meals').where(id, user_id).delete()

    if (count > 0) return reply.status(204).send()
    reply.status(404).send()
  })

  app.get('/:id', async (request, reply) => {
    const { id } = getMealIdSchema.parse(request.params)
    const { user_id } = request.cookies

    const meal = await knex('meals').where({ id, user_id }).first()

    return reply.status(202).send({ meal })
  })

  app.get('/', async (request, reply) => {
    const { user_id } = request.cookies

    const meals = await knex('meals').where({ user_id })

    return reply.status(202).send({ meals })
  })

  app.get('/summary', async (request, reply) => {
    const { user_id } = request.cookies

    const totalMeals = await knex('meals')
      .count('id', { as: 'total' })
      .where({ user_id })
      .first()

    const totalMealsOnDiet = await knex('meals')
      .count('id', { as: 'totalMealsOnDiet' })
      .where({ user_id, is_on_diet: true })
      .first()

    const totalMealsOutDiet = await knex('meals')
      .count('id', { as: 'totalMealsOutDiet' })
      .where({ user_id, is_on_diet: false })
      .first()

    const meals = await knex
      .column('date', 'is_on_diet', 'title')
      .select()
      .from('meals')
      .where({ user_id })
      .orderBy('date', 'asc')

    const sequences: number[] = []
    let total = 0
    let bestSequence = 0

    meals.forEach((value) => {
      if (value.is_on_diet) {
        total = total + 1
        console.log(total)
      } else {
        sequences.push(total)
        if (bestSequence < total) bestSequence = total
        total = 0
      }
    })
    sequences.push(total)
    if (bestSequence < total) bestSequence = total
    console.log('best squence=', bestSequence)

    return {
      ...totalMeals,
      ...totalMealsOnDiet,
      ...totalMealsOutDiet,
      bestSequence,
    }
  })
}
