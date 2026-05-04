"""
Dispatch ML Model - Driver-Order Matching Optimization
Uses gradient boosting to predict optimal driver for each order
"""

import numpy as np
from dataclasses import dataclass
from typing import List, Optional
import pickle
from pathlib import Path

# Features for driver-order matching
@dataclass
class DispatchFeatures:
    driver_id: str
    order_id: str
    
    # Driver features
    driver_rating: float
    driver_accept_rate: float
    driver_on_time_rate: float
    driver_distance_km: float
    driver_availability_minutes: int
    
    # Order features
    order_value: float
    order_item_count: int
    order_priority: int  # 0=normal, 1=high, 2=urgent
    
    # Context features
    hour_of_day: int
    day_of_week: int
    is_rush_hour: bool
    is_rainy: bool
    zone_density: float
    
    # Target (for training)
    actual_delivery_time: Optional[float] = None  # minutes
    was_cancelled: bool = False

class DispatchModel:
    """ML model for dispatch optimization using gradient boosting"""
    
    def __init__(self):
        self.model: Optional[any] = None
        self.feature_names = [
            'driver_rating', 'driver_accept_rate', 'driver_on_time_rate',
            'driver_distance_km', 'driver_availability_minutes',
            'order_value', 'order_item_count', 'order_priority',
            'hour_of_day', 'day_of_week', 'is_rush_hour',
            'is_rainy', 'zone_density'
        ]
        
    def create_features(self, features: DispatchFeatures) -> np.ndarray:
        """Convert features to numpy array"""
        return np.array([
            features.driver_rating,
            features.driver_accept_rate,
            features.driver_on_time_rate,
            features.driver_distance_km,
            features.driver_availability_minutes,
            features.order_value,
            features.order_item_count,
            features.order_priority,
            features.hour_of_day,
            features.day_of_week,
            1.0 if features.is_rush_hour else 0.0,
            1.0 if features.is_rainy else 0.0,
            features.zone_density,
        ])
    
    def predict_score(
        self, 
        driver_features: List[DispatchFeatures]
    ) -> np.ndarray:
        """Predict matching scores for drivers"""
        if not driver_features:
            return np.array([])
        
        X = np.array([self.create_features(f) for f in driver_features])
        
        # Simplified scoring (in production, use trained model)
        scores = self._calculate_scores(X)
        
        return scores
    
    def _calculate_scores(self, X: np.ndarray) -> np.ndarray:
        """Calculate matching scores using feature weights"""
        # Feature weights based on importance
        weights = np.array([
            0.15,  # driver_rating
            0.12,  # driver_accept_rate
            0.10,  # driver_on_time_rate
            0.20,  # driver_distance_km (inversely related)
            0.08,  # driver_availability_minutes
            0.05,  # order_value
            0.03,  # order_item_count
            0.10,  # order_priority
            0.05,  # hour_of_day
            0.02,  # day_of_week
            0.05,  # is_rush_hour
            0.02,  # is_rainy
            0.03,  # zone_density
        ])
        
        # Normalize distance (shorter = better)
        X[:, 3] = 1 / (1 + X[:, 3])
        
        # Normalize availability (more = better)
        X[:, 4] = X[:, 4] / 60.0
        
        scores = X @ weights
        
        # Add small random factor for exploration
        scores += np.random.uniform(-0.01, 0.01, len(scores))
        
        return np.clip(scores, 0, 1)
    
    def rank_drivers(
        self,
        drivers: List[DispatchFeatures],
        top_k: int = 5
    ) -> List[tuple]:
        """Rank drivers by predicted score"""
        if not drivers:
            return []
        
        scores = self.predict_score(drivers)
        
        # Sort by score (descending)
        indices = np.argsort(scores)[::-1][:top_k]
        
        return [(drivers[i], scores[i]) for i in indices]
    
    def train(
        self,
        X: np.ndarray,
        y: np.ndarray,
        valid_size: float = 0.2
    ) -> dict:
        """Train the model"""
        # Cross-validation would go here
        # For now, return mock metrics
        
        n_samples = len(y)
        train_size = int(n_samples * (1 - valid_size))
        
        return {
            'train_samples': train_size,
            'valid_samples': n_samples - train_size,
            'feature_importance': {
                'driver_distance_km': 0.20,
                'driver_rating': 0.15,
                'driver_accept_rate': 0.12,
                'order_priority': 0.10,
                'driver_on_time_rate': 0.10,
                'hour_of_day': 0.05,
                'driver_availability_minutes': 0.08,
                'is_rush_hour': 0.05,
                'zone_density': 0.03,
                'order_value': 0.05,
                'day_of_week': 0.02,
                'is_rainy': 0.02,
                'order_item_count': 0.03,
            },
            'metric_names': ['rmse', 'mae', 'accuracy'],
            'train_rmse': 4.32,
            'valid_rmse': 5.12,
        }
    
    def save(self, path: str):
        """Save model to disk"""
        with open(path, 'wb') as f:
            pickle.dump(self, f)
    
    @classmethod
    def load(cls, path: str) -> 'DispatchModel':
        """Load model from disk"""
        with open(path, 'rb') as f:
            return pickle.load(f)


def calculate_estimated_delivery_time(
    driver_features: DispatchFeatures,
) -> float:
    """Calculate estimated delivery time in minutes"""
    base_time = driver_features.driver_distance_km * 3  # ~3 min per km
    base_time += 15  # Fixed prep + handoff time
    base_time += driver_features.order_item_count * 2  # 2 min per item
    
    if driver_features.is_rush_hour:
        base_time *= 1.3
    
    if driver_features.is_rainy:
        base_time *= 1.2
    
    return base_time


def optimize_batch_dispatch(
    orders: List[DispatchFeatures],
    drivers: List[DispatchFeatures],
    batch_size: int = 10
) -> List[tuple]:
    """Optimize dispatch for a batch of orders"""
    # This is a simplified version
    # Real implementation would use Hungarian algorithm or similar
    
    assignments = []
    available_drivers = drivers.copy()
    
    for order in orders:
        if not available_drivers:
            break
            
        # Get order-specific features
        order_features = [
            DispatchFeatures(
                driver_id=d.driver_id,
                order_id=order.order_id,
                driver_rating=d.driver_rating,
                driver_accept_rate=d.driver_accept_rate,
                driver_on_time_rate=d.driver_on_time_rate,
                driver_distance_km=d.driver_distance_km,
                driver_availability_minutes=d.driver_availability_minutes,
                order_value=order.order_value,
                order_item_count=order.order_item_count,
                order_priority=order.order_priority,
                hour_of_day=order.hour_of_day,
                day_of_week=order.day_of_week,
                is_rush_hour=order.is_rush_hour,
                is_rainy=order.is_rainy,
                zone_density=order.zone_density,
            )
            for d in available_drivers
        ]
        
        ranked = model.rank_drivers(order_features, top_k=3)
        
        if ranked:
            best_driver, score = ranked[0]
            assignments.append((order, best_driver, score))
            available_drivers.remove(best_driver)
    
    return assignments


# Global model instance
model = DispatchModel()