-- CreateTable
CREATE TABLE "ComputedPrediction" (
    "modelVersion" TEXT NOT NULL,
    "sqft" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "ComputedPrediction_pkey" PRIMARY KEY ("sqft","bedrooms","modelVersion")
);

-- CreateTable
CREATE TABLE "PredictionTransaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "predictionSqft" INTEGER NOT NULL,
    "predictionBedrooms" INTEGER NOT NULL,
    "predictionModelVersion" TEXT NOT NULL,

    CONSTRAINT "PredictionTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PredictionTransaction" ADD CONSTRAINT "PredictionTransaction_predictionSqft_predictionBedrooms_pr_fkey" FOREIGN KEY ("predictionSqft", "predictionBedrooms", "predictionModelVersion") REFERENCES "ComputedPrediction"("sqft", "bedrooms", "modelVersion") ON DELETE RESTRICT ON UPDATE CASCADE;
