import { DemandPredictionService } from '../apps/svc-ai/src/prediction/demand-prediction.service';

describe('DemandPredictionService', () => {
  let service: DemandPredictionService;

  beforeEach(() => {
    service = new DemandPredictionService();
  });

  describe('predict', () => {
    it('should predict demand for next hours', async () => {
      const predictions = await service.predict('johannesburg', 4);
      expect(predictions.length).toBe(4);
      predictions.forEach(p => {
        expect(p.predictedOrders).toBeGreaterThanOrEqual(0);
        expect(p.confidenceLow).toBeLessThanOrEqual(p.predictedOrders);
        expect(p.confidenceHigh).toBeGreaterThanOrEqual(p.predictedOrders);
      });
    });

    it('should predict higher demand during peak hours', async () => {
      const predictions = await service.predict('johannesburg', 24);
      const peakPredictions = predictions.filter(p => p.hour >= 17 && p.hour <= 21);
      const offPeakPredictions = predictions.filter(p => p.hour < 6 || p.hour > 23);

      const avgPeak = peakPredictions.reduce((s, p) => s + p.predictedOrders, 0) / peakPredictions.length;
      const avgOffPeak = offPeakPredictions.reduce((s, p) => s + p.predictedOrders, 0) / offPeakPredictions.length;

      expect(avgPeak).toBeGreaterThan(avgOffPeak);
    });
  });

  describe('recommendPricing', () => {
    it('should recommend higher pricing for high demand', async () => {
      const recommendation = await service.recommendPricing('johannesburg');
      expect(recommendation.multiplier).toBeGreaterThanOrEqual(0.9);
      expect(recommendation.multiplier).toBeLessThanOrEqual(2.0);
    });
  });
});