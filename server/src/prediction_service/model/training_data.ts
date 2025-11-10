export interface TrainingSample {
  sqft: number;
  bedrooms: number;
  price: number;
}

export const TRAINING_DATA: TrainingSample[] = [
  { sqft: 800, bedrooms: 2, price: 150000 },
  { sqft: 1200, bedrooms: 3, price: 200000 },
  { sqft: 1500, bedrooms: 3, price: 250000 },
  { sqft: 1800, bedrooms: 4, price: 300000 },
  { sqft: 2000, bedrooms: 4, price: 320000 },
  { sqft: 2200, bedrooms: 5, price: 360000 },
  { sqft: 2400, bedrooms: 4, price: 380000 },
  { sqft: 2600, bedrooms: 5, price: 400000 }
];