"""
Demand Forecasting - Time series prediction for order demand
Predicts demand patterns for staffing and inventory planning
"""

import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime, timedelta

@dataclass
class DemandDataPoint:
    """Historical demand data point"""
    timestamp: datetime
    zone: str
    day_of_week: int
    hour_of_day: int
    is_holiday: bool
    weather: str  # clear, rain, cloudy
    orders: int

@dataclass
class DemandForecast:
    """Demand forecast prediction"""
    zone: str
    hour: int
    predicted_orders: float
    confidence_low: float
    confidence_high: float
    peak_likely: bool

class DemandForecaster:
    """Time series demand forecasting model"""
    
    def __init__(self):
        self.seasonal_factors = self._initialize_seasonal_factors()
        self.zone_baselines = {}
        
    def _initialize_seasonal_factors(self) -> Dict:
        """Initialize seasonal patterns"""
        return {
            # Day of week factors (0 = Monday)
            'day_of_week': {
                0: 0.85,  # Monday - lowest
                1: 0.90,
                2: 0.92,
                3: 0.95,
                4: 1.00,
                5: 1.15,
                6: 1.20,  # Saturday - peak
            },
            # Hour of day factors
            'hour': {
                6: 0.2, 7: 0.3, 8: 0.4, 9: 0.5,
                10: 0.6, 11: 0.7, 12: 0.9, 13: 0.8,
                14: 0.7, 15: 0.7, 16: 0.8, 17: 1.0,
                18: 1.2, 19: 1.3, 20: 1.2, 21: 1.0,
                22: 0.8, 23: 0.5, 0: 0.3, 1: 0.2,
            },
        }
    
    def fit(self, historical_data: List[DemandDataPoint]) -> dict:
        """Fit the model to historical data"""
        # Calculate zone baselines
        zone_orders = {}
        for point in historical_data:
            if point.zone not in zone_orders:
                zone_orders[point.zone] = []
            zone_orders[point.zone].append(point.orders)
        
        self.zone_baselines = {
            zone: np.mean(orders)
            for zone, orders in zone_orders.items()
        }
        
        # Return mock metrics
        return {
            'zones_learned': len(self.zone_baselines),
            'data_points': len(historical_data),
            'rmse': 12.5,
            'mae': 8.3,
        }
    
    def predict(
        self,
        zone: str,
        hours_ahead: int = 24
    ) -> List[DemandForecast]:
        """Predict demand for next N hours"""
        forecasts = []
        now = datetime.now()
        baseline = self.zone_baselines.get(zone, 100)
        
        for h in range(hours_ahead):
            prediction_time = now + timedelta(hours=h)
            
            hour = prediction_time.hour
            day = prediction_time.weekday()
            
            # Apply seasonal factors
            hour_factor = self.seasonal_factors['hour'].get(hour, 1.0)
            day_factor = self.seasonal_factors['day_of_week'].get(day, 1.0)
            
            predicted = baseline * hour_factor * day_factor
            
            # Calculate confidence interval
            uncertainty = 0.15  # 15% uncertainty
            ci = predicted * uncertainty
            
            is_peak = hour >= 17 and hour <= 20 and day >= 4
            
            forecasts.append(DemandForecast(
                zone=zone,
                hour=hour,
                predicted_orders=round(predicted, 1),
                confidence_low=round(predicted - ci, 1),
                confidence_high=round(predicted + ci, 1),
                peak_likely=is_peak
            ))
        
        return forecasts
    
    def predict_zone_demand(
        self,
        zone: str,
        date: datetime
    ) -> Dict[int, DemandForecast]:
        """Predict hourly demand for a specific day in a zone"""
        forecasts = self.predict(zone, 24)
        
        return {f.hour: f for f in forecasts if f.hour == date.hour}
    
    def get_peak_hours(self, zone: str) -> List[int]:
        """Get typical peak hours for a zone"""
        forecasts = self.predict(zone, 24)
        peak_hours = []
        
        for f in forecasts:
            if f.peak_likely:
                peak_hours.append(f.hour)
        
        return peak_hours
    
    def recommend_staffing(
        self,
        zone: str,
        date: datetime,
        orders_per_driver: int = 10
    ) -> Dict[int, int]:
        """Recommend driver staffing levels"""
        forecasts = self.predict(zone, 24)
        recommendations = {}
        
        for f in forecasts:
            # Calculate needed drivers
            needed = max(1, int(f.predicted_orders / orders_per_driver))
            
            # Add buffer during peak
            if f.peak_likely:
                needed = int(needed * 1.3)
            
            recommendations[f.hour] = needed
        
        return recommendations
    
    def predict_surge_multiplier(
        self,
        zone: str,
        datetime: datetime
    ) -> float:
        """Predict surge pricing multiplier"""
        forecasts = self.predict(zone, 1)
        
        if not forecasts:
            return 1.0
        
        f = forecasts[0]
        
        if f.peak_likely and f.predicted_orders > f.confidence_high:
            return 1.3  # 30% surge
        
        return 1.0


class MultiZoneDemandModel:
    """Multi-zone demand forecasting with spatial relationships"""
    
    def __init__(self):
        self.zones: Dict[str, DemandForecaster] = {}
        self.correlation_matrix: Dict[str, Dict[str, float]] = {}
    
    def add_zone(self, zone: str, data: List[DemandDataPoint]) -> dict:
        """Add zone and train model"""
        model = DemandForecaster()
        metrics = model.fit(data)
        self.zones[zone] = model
        return metrics
    
    def predict_all_zones(
        self,
        hour: int
    ) -> Dict[str, DemandForecast]:
        """Predict demand for all zones"""
        predictions = {}
        
        for zone, model in self.zones.items():
            forecasts = model.predict(zone, 1)
            if forecasts:
                predictions[zone] = forecasts[0]
        
        return predictions
    
    def identify_hot_zones(
        self,
        hour: int,
        threshold: float = 150
    ) -> List[str]:
        """Identify zones with high demand"""
        predictions = self.predict_all_zones(hour)
        
        return [
            zone for zone, pred in predictions.items()
            if pred.predicted_orders > threshold
        ]


# Global model
forecaster = DemandForecaster()