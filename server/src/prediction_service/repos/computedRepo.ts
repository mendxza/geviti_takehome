import { PrismaClient, ComputedPrediction } from '@prisma/client'
import { ComputedPredictionRepo, PredictionRequestArgs, CompletedPredictionArgs } from '../prediction_types'

export default class ComputedRepo implements ComputedPredictionRepo {
    constructor(
        private prisma: PrismaClient
    ) { }

    async find({ modelVersion, sqft, bedrooms }: PredictionRequestArgs): Promise<ComputedPrediction | null> {
        return this.prisma.computedPrediction.findUnique({
            where: {
                computed_prediction_pk: {
                    modelVersion,
                    sqft,
                    bedrooms
                }
            }
        })
    }
    async upsert({ modelVersion, sqft, bedrooms, price }: CompletedPredictionArgs): Promise<void> {
        await this.prisma.computedPrediction.upsert({
            where: {
                computed_prediction_pk: {
                    modelVersion,
                    sqft,
                    bedrooms
                }
            },
            create: {
                modelVersion,
                sqft,
                bedrooms,
                price
            },
            update: {
                price
            }
        })
    }
}