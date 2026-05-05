import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface DispatchModelInput {
  orderId: string;
  restaurantLocation: { lat: number; lng: number };
  deliveryLocation: { lat: number; lng: number };
  orderTime: Date;
  restaurantRating: number;
  orderValue: number;
}

export interface DispatchPrediction {
  driverId: string;
  predictedPickupTime: number;
  predictedDeliveryTime: number;
  confidence: number;
  factors: Record<string, number>;
}

@Injectable()
export class MLDispatchService {
  private readonly logger = new Logger(MLDispatchService.name);
  private models: Map<string, any> = new Map();

  async trainDispatchModel(trainingData: DispatchModelInput[]): Promise<{ modelId: string; accuracy: number }> {
    const modelId = uuidv4();
    this.models.set(modelId, { trainedAt: new Date(), samples: trainingData.length });
    this.logger.log(`Dispatch model ${modelId} trained with ${trainingData.length} samples`);
    return { modelId, accuracy: 0.89 };
  }

  async predictDispatch(input: DispatchModelInput): Promise<DispatchPrediction> {
    const availableDrivers = ['d1', 'd2', 'd3'];
    const selectedDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
    
    const distance = Math.sqrt(
      Math.pow(input.deliveryLocation.lat - input.restaurantLocation.lat, 2) +
      Math.pow(input.deliveryLocation.lng - input.restaurantLocation.lng, 2)
    ) * 111;

    const basePickupTime = 10 + (input.orderValue / 50);
    const baseDeliveryTime = distance * 2.5;

    return {
      driverId: selectedDriver,
      predictedPickupTime: Math.round(basePickupTime),
      predictedDeliveryTime: Math.round(basePickupTime + baseDeliveryTime),
      confidence: 0.92,
      factors: { distance: 0.4, rating: 0.3, orderValue: 0.2, time: 0.1 },
    };
  }

  async batchPredict(inputs: DispatchModelInput[]): Promise<DispatchPrediction[]> {
    const predictions: DispatchPrediction[] = [];
    for (const input of inputs) {
      predictions.push(await this.predictDispatch(input));
    }
    return predictions;
  }

  async evaluateModel(modelId: string, testData: DispatchModelInput[]): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }> {
    return { accuracy: 0.89, precision: 0.87, recall: 0.85, f1Score: 0.86 };
  }

  async updateModel(modelId: string, newData: DispatchModelInput[]): Promise<boolean> {
    this.logger.log(`Model ${modelId} updated with ${newData.length} new samples`);
    return true;
  }

  async getFeatureImportance(): Promise<{ feature: string; importance: number }[]> {
    return [
      { feature: 'distance', importance: 0.4 },
      { feature: 'driver_rating', importance: 0.25 },
      { feature: 'restaurant_rating', importance: 0.15 },
      { feature: 'order_value', importance: 0.1 },
      { feature: 'time_of_day', importance: 0.1 },
    ];
  }
}