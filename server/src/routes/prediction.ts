import { FastifyPluginAsync } from 'fastify'
import { BasePredictionArgs } from '../prediction_service/prediction_types'
import PredictionOrchestrator from '../prediction_service/orchestrator'
import ComputedRepo from '../prediction_service/repos/computedRepo'
import PredictionModel from '../prediction_service/model'
import TransactionRepo from '../prediction_service/repos/transactionRepo'

const predictionRequestSchema = {
    type: 'object',
    properties: {
        sqft: { type: 'number', minimum: 1 },
        bedrooms: { type: 'number', minimum: 0 }
    },
    required: ['sqft', 'bedrooms'],
    additionalProperties: false
}

const predictionResponseSchema = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        modelVersion: { type: 'string', minLength: 1 },
        price: { type: 'number', minimum: 0 },
        sqft: { type: 'number', minimum: 1 },
        bedrooms: { type: 'number', minimum: 0 },
    },
    required: ['id', 'createdAt', 'modelVersion', 'price', 'sqft', 'bedrooms'],
    additionalProperties: false,
}

const predictionRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.post('/predictions', { schema: { body: predictionRequestSchema, response: { 201: predictionResponseSchema } } }, async function (request, reply) {
        const { sqft, bedrooms } = request.body as BasePredictionArgs

        const model = new PredictionModel()
        const computedRepo = new ComputedRepo(fastify.prisma)
        const transactionRepo = new TransactionRepo(fastify.prisma)

        const orchestrator = new PredictionOrchestrator(
            model,
            computedRepo,
            transactionRepo
        )

        const { transaction, price } = await orchestrator.predict({ sqft, bedrooms })

        return reply.code(201).send({
            id: transaction.id,
            createdAt: transaction.createdAt,
            modelVersion: transaction.predictionModelVersion,
            sqft: transaction.predictionSqft,
            bedrooms: transaction.predictionBedrooms,
            price

        })
    })

    fastify.get('/predictions', {
        schema: {
            response: {
                200: {
                    type: 'array',
                    items: predictionResponseSchema
                }
            }
        }
    }, async function (request, reply) {
        const rows = await fastify.prisma.predictionTransaction.findMany({
            orderBy: { createdAt: 'desc' },
            include: { prediction: true }
        })

        const payload = rows.map(row => ({
            id: row.id,
            createdAt: row.createdAt,
            modelVersion: row.predictionModelVersion,
            sqft: row.predictionSqft,
            bedrooms: row.predictionBedrooms,
            price: row.prediction?.price ?? 0
        }))

        return reply.send(payload)
    })
}

export default predictionRoutes