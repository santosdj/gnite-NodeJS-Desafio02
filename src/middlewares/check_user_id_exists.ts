/* eslint-disable camelcase */
import { FastifyReply } from 'fastify/types/reply'
import { FastifyRequest } from 'fastify/types/request'

export async function checkUserIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user_id = request.cookies.user_id

  if (!user_id) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}
