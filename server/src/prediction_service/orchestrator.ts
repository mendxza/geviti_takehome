
import ComputedRepo from "./repos/computedRepo"
import TransactionRepo from "./repos/transactionRepo"
import PredictionModel from "./model"

export default class PredictionOrchestrator {
    constructor(
        private model: PredictionModel,
        private computedRepo: ComputedRepo,
        private transactionRepo: TransactionRepo
    ) { }

    async predict(
        { sqft, bedrooms, modelVersion = this.model.modelVersion }:
            { sqft: number, bedrooms: number, modelVersion?: string }
    ) {
        const computedPrediction = await this.computedRepo.find({
            modelVersion, sqft, bedrooms
        })
        if (computedPrediction) {
            const txn = await this.transactionRepo.create({ modelVersion, sqft, bedrooms, })
            return { transaction: txn, price: computedPrediction.price }
        }

        const price = await this.model.predict({ sqft, bedrooms })
        console.log('price', price)
        await this.computedRepo.upsert({ modelVersion, sqft, bedrooms, price })
        const txn = await this.transactionRepo.create({ modelVersion, sqft, bedrooms })
        return { transaction: txn, price: price }

    }
}