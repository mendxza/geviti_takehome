import MLR from "ml-regression-multivariate-linear"
import type { PredictionModel as PredictionModelContract, BasePredictionArgs } from "../prediction_types"
import { TRAINING_DATA } from "./training_data"

const FEATURE_MATRIX = TRAINING_DATA.map(({ sqft, bedrooms }) => [sqft, bedrooms])
const TARGET_VECTOR = TRAINING_DATA.map(({ price }) => [price])

const regressionModel = new MLR(FEATURE_MATRIX, TARGET_VECTOR)

export default class PredictionModel implements PredictionModelContract {
  static MODEL_VERSION = "v1"
  readonly modelVersion = PredictionModel.MODEL_VERSION

  async predict({ sqft, bedrooms }: BasePredictionArgs) {
    const result = regressionModel.predict([sqft, bedrooms])
    const price = Array.isArray(result) ? result[0] : result
    return Number(price.toFixed(0));
  }
}
