import { PredictionTransaction, PrismaClient } from "@prisma/client";
import { PredictionRequestArgs, TransactionRepo as TransactionRepoContract } from '../prediction_types'

export default class TransactionRepo implements TransactionRepoContract {
    constructor(
        private prisma: PrismaClient,
    ) { }

    async create({ modelVersion, sqft, bedrooms }: PredictionRequestArgs): Promise<PredictionTransaction> {
        return this.prisma.predictionTransaction.create({
            data: {
                prediction: {
                    connect: {
                        computed_prediction_pk: {
                            modelVersion,
                            sqft,
                            bedrooms
                        }
                    }
                }
            }
        })
    }
}