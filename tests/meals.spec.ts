import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'node:child_process'

describe('Meals Routes', () => {
  beforeAll(async () => {
    // executar as migrations
    // execSync('npm run knex:migrate:latest')
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('it should not be possible to create a meal without an user identification', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        title: 'Meal TEST julho',
        description: 'teste meal julho',
        date: '2023-07-01',
        is_on_diet: false,
      })
      .expect(401)
  })

  it('should be possible to create a meal ', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Sheila Ribeiro',
        birthday: '1960-03-29',
        email: 'sheilarpereira@gmail.com',
        phone: '11996279842',
        avatar: '/imgs/01.jpg',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        title: 'Meal TEST julho',
        description: 'teste meal julho',
        date: '2023-07-01',
        is_on_diet: false,
      })
      .expect(201)
  })

  it('should be possible to list all meals of a specific user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Sheila Ribeiro',
      birthday: '1960-03-29',
      email: 'sheilarpereira@gmail.com',
      phone: '11996279842',
      avatar: '/imgs/01.jpg',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'Meal TEST julho',
      description: 'teste meal julho',
      date: '2023-07-01',
      is_on_diet: false,
    })

    const listMealsResponse = await request(app.server)
      .get(`/meals`)
      .set('Cookie', cookies)
      .expect(202)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        title: 'Meal TEST julho',
        description: 'teste meal julho',
        is_on_diet: 0,
      }),
    ])
  })

  it('should be possible to get one specific meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Sheila Ribeiro',
      birthday: '1960-03-29',
      email: 'sheilarpereira@gmail.com',
      phone: '11996279842',
      avatar: '/imgs/01.jpg',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'Meal TEST julho',
      description: 'teste meal julho',
      date: '2023-07-01',
      is_on_diet: false,
    })

    const listMealsResponse = await request(app.server)
      .get(`/meals`)
      .set('Cookie', cookies)
      .expect(202)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(202)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        title: 'Meal TEST julho',
        description: 'teste meal julho',
        is_on_diet: 0,
      }),
    )
  })

  it('should be possible to delete one meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Sheila Ribeiro',
      birthday: '1960-03-29',
      email: 'sheilarpereira@gmail.com',
      phone: '11996279842',
      avatar: '/imgs/01.jpg',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'Meal TEST julho',
      description: 'teste meal julho',
      date: '2023-07-01',
      is_on_diet: false,
    })

    const listMealsResponse = await request(app.server)
      .get(`/meals`)
      .set('Cookie', cookies)
      .expect(202)

    const mealId = listMealsResponse.body.meals[0].id
    console.log(mealId)

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it.only('should be possible to edit one meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Sheila Ribeiro',
      birthday: '1960-03-29',
      email: 'sheilarpereira@gmail.com',
      phone: '11996279842',
      avatar: '/imgs/01.jpg',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'Meal TEST julho',
      description: 'teste meal julho',
      date: '2023-07-01',
      is_on_diet: false,
    })

    const listMealsResponse = await request(app.server)
      .get(`/meals`)
      .set('Cookie', cookies)
      .expect(202)

    const mealId = listMealsResponse.body.meals[0].id

    const updateMealResponse = await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        title: 'Meal TEST julho updated',
        description: 'teste meal julho updated',
        date: '2023-07-01',
        is_on_diet: true,
      })
      .expect(204)

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(202)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        title: 'Meal TEST julho updated',
        description: 'teste meal julho updated',
        is_on_diet: 1,
      }),
    )
  })

  it.todo('should be possible to get user meal summary')

  /*
[ ] - Deve ser possível recuperar as métricas de um usuário
    [ ]- Qtd total de refeições registradas
    [ ]- Qtd total de refeições dentro da dieta
    [ ]- Qtd total de refeições fora da dieta
    [ ]- Melhor sequência de refeições dentro da dieta */
})

/*


let id = ''
const cookieUserIdRegex = /user_id=([a-zA-Z\d-]+)/g

const params = cookies[0].match(cookieUserIdRegex)
if (params) id = params[0].split('=')[1] */
