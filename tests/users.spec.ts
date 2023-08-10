import request from 'supertest'
import { expect, test, beforeAll, afterAll, describe, it } from 'vitest'
import { app } from '../src/app'

describe('User Routes', () => {
  beforeAll(async () => {
    console.log('loading test environment ...')
    await app.ready()
    console.log('loading test environment ... done!')
  })
  afterAll(async () => {
    await app.close()
  })
  it('it should be possible to create an user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Sheila Ribeiro',
        birthday: '1960-03-29',
        email: 'sheilarpereira@gmail.com',
        phone: '11996279842',
        avatar: '/imgs/01.jpg',
      })
      .expect(201)
  })
})
