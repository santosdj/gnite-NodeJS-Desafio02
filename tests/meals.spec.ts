import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'

describe('Meals Routes', () => {
  beforeAll(async () => {
    console.log('loading test environment ...')
    await app.ready()
    console.log('loading test environment ... done!')
  })
  afterAll(async () => {
    await app.close()
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

  it.only('should be possible to list all meals of a specific user', async () => {
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

    console.log('meals = ', listMealsResponse.body)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        title: 'Meal TEST julho',
        description: 'teste meal julho',
        is_on_diet: 0,
      }),
    ])
  })

  it.todo('should be possible to edit one meal', async () => {
    console.log('todo')
  })

  it.todo('should be possible to delete one meal')

  it.todo('should be possible to get one specific meal')

  it.todo('should be possible to get user meal summary')

  /*
  [ ] - Deve ser possível editar uma refeição, podendo alterar todos os dados
[ ] - Deve ser possível apagar uma refeição
[ ] - Deve ser possível listar todas as refeições de um usuário
[ ] - Deve ser possível visualizar uma única refeição
[ ] - Deve ser possível recuperar as métricas de um usuário
    [ ]- Qtd total de refeições registradas
    [ ]- Qtd total de refeições dentro da dieta
    [ ]- Qtd total de refeições fora da dieta
    [ ]- Melhor seguência de refeições dentro da dieta */
})

/*


let id = ''
const cookieUserIdRegex = /user_id=([a-zA-Z\d-]+)/g

const params = cookies[0].match(cookieUserIdRegex)
if (params) id = params[0].split('=')[1] */
