import { PredictionTransaction, ComputedPrediction } from "@prisma/client"


export interface BasePredictionArgs {
    sqft: number,
    bedrooms: number
}
export interface PredictionRequestArgs extends BasePredictionArgs{
    modelVersion: string 
}

export interface CompletedPredictionArgs extends PredictionRequestArgs{
    price: number
}

export interface PredictionModel{
    modelVersion: string,
    predict: (args: BasePredictionArgs) => Promise<number>
}

export interface ComputedPredictionRepo{
    find: (args: PredictionRequestArgs) => Promise<ComputedPrediction | null>,
    upsert: (args: CompletedPredictionArgs) => Promise<void>
}

export interface TransactionRepo {
    create: (args: CompletedPredictionArgs) => Promise<PredictionTransaction>
}

