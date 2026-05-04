"""
Anomaly Detection - Statistical and ML-based anomaly detection
Detects unusual patterns in orders, drivers, and system metrics
"""

import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
from collections import deque

@dataclass
class Anomaly:
    """Detected anomaly"""
    id: str
    type: str
    severity: str  # low, medium, high, critical
    description: str
    details: dict
    timestamp: str

class StatisticalDetector:
    """Statistical anomaly detection using z-scores and IQR"""
    
    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.histories: Dict[str, deque] = {}
        
    def add_data(self, metric: str, value: float):
        """Add data point to history"""
        if metric not in self.histories:
            self.histories[metric] = deque(maxlen=self.window_size)
        
        self.histories[metric].append(value)
    
    def detect_zscore(
        self,
        metric: str,
        value: float,
        threshold: float = 3.0
    ) -> Optional[Anomaly]:
        """Detect anomalies using z-score"""
        history = self.histories.get(metric)
        
        if not history or len(history) < 10:
            return None
        
        # Calculate statistics
        mean = np.mean(history)
        std = np.std(history)
        
        if std == 0:
            return None
        
        z_score = abs((value - mean) / std)
        
        if z_score > threshold:
            return Anomaly(
                id=f"anomaly_{metric}_{int(value)}",
                type='zscore',
                severity='high' if z_score > 4 else 'medium',
                description=f"Unusual {metric} value: {value:.2f}",
                details={
                    'metric': metric,
                    'value': value,
                    'mean': mean,
                    'std': std,
                    'z_score': z_score,
                },
                timestamp=np.datetime64('now')
            )
        
        return None
    
    def detect_iqr(
        self,
        metric: str,
        value: float,
        factor: float = 1.5
    ) -> Optional[Anomaly]:
        """Detect anomalies using IQR method"""
        history = self.histories.get(metric)
        
        if not history or len(history) < 10:
            return None
        
        data = np.array(list(history))
        q1 = np.percentile(data, 25)
        q3 = np.percentile(data, 75)
        iqr = q3 - q1
        
        lower = q1 - factor * iqr
        upper = q3 + factor * iqr
        
        if value < lower or value > upper:
            return Anomaly(
                id=f"anomaly_{metric}_{int(value)}",
                type='iqr',
                severity='medium',
                description=f"Value outside normal range: {value}",
                details={
                    'metric': metric,
                    'value': value,
                    'q1': q1,
                    'q3': q3,
                    'iqr': iqr,
                    'lower': lower,
                    'upper': upper,
                },
                timestamp=np.datetime64('now')
            )
        
        return None


class PatternDetector:
    """Detects unusual patterns in sequences"""
    
    def __init__(self):
        self.sequences: Dict[str, deque] = {}
        
    def add_sequence(self, key: str, value: str):
        """Add to sequence history"""
        if key not in self.sequences:
            self.sequences[key] = deque(maxlen=50)
        
        self.sequences[key].append(value)
    
    def detect_rate_change(
        self,
        key: str,
        new_value: str,
        threshold: float = 0.3
    ) -> Optional[Anomaly]:
        """Detect sudden rate changes"""
        history = self.sequences.get(key)
        
        if not history or len(history) < 20:
            return None
        
        # Calculate current rate
        recent = list(history)[-10:]
        new_rate = recent.count(new_value) / len(recent)
        
        # Compare to historical
        historical_rate = history.count(new_value) / len(history)
        
        if abs(new_rate - historical_rate) > threshold:
            return Anomaly(
                id=f"pattern_{key}_{new_value}",
                type='rate_change',
                severity='medium',
                description=f"Unusual rate change for {new_value}",
                details={
                    'key': key,
                    'value': new_value,
                    'new_rate': new_rate,
                    'historical_rate': historical_rate,
                },
                timestamp=np.datetime64('now')
            )
        
        return None


class AnomalyDetector:
    """Main anomaly detection service"""
    
    def __init__(self):
        self.statistical = StatisticalDetector(window_size=100)
        self.pattern = PatternDetector()
        self.rules: Dict[str, callable] = {}
        self._initialize_rules()
        
    def _initialize_rules(self):
        """Initialize detection rules"""
        self.rules = {
            'order_value': lambda v: self.analyze_order_value(v),
            'driver_cancel_rate': lambda v: self.analyze_driver_cancels(v),
            'delivery_time': lambda v: self.analyze_delivery_time(v),
            'driver_response_time': lambda v: self.analyze_driver_response(v),
        }
    
    def analyze_order_value(self, value: dict) -> Optional[Anomaly]:
        """Analyze order value anomalies"""
        total = value.get('total', 0)
        
        self.statistical.add_data('order_value', total)
        
        return self.statistical.detect_zscore('order_value', total, threshold=4.0)
    
    def analyze_driver_cancels(self, value: dict) -> Optional[Anomaly]:
        """Analyze driver cancellation rate"""
        cancel_rate = value.get('cancel_rate', 0)
        
        self.statistical.add_data('cancel_rate', cancel_rate)
        
        if cancel_rate > 0.15:  # >15% is problematic
            return Anomaly(
                id=f"driver_cancel_{value.get('driver_id')}",
                type='rule',
                severity='high',
                description=f"High cancellation rate: {cancel_rate:.1%}",
                details=value,
                timestamp=np.datetime64('now')
            )
        
        return self.statistical.detect_zscore('cancel_rate', cancel_rate)
    
    def analyze_delivery_time(self, value: dict) -> Optional[Anomaly]:
        """Analyze delivery time"""
        delivery_time = value.get('delivery_time_minutes', 0)
        
        self.statistical.add_data('delivery_time', delivery_time)
        
        return self.statistical.detect_zscore('delivery_time', delivery_time, threshold=3.0)
    
    def analyze_driver_response(self, value: dict) -> Optional[Anomaly]:
        """Analyze driver response time"""
        response_time = value.get('response_time_seconds', 0) / 60  # convert to minutes
        
        self.statistical.add_data('driver_response', response_time)
        
        if response_time > 5:  # >5 minutes is slow
            return Anomaly(
                id=f"driver_response_{value.get('driver_id')}",
                type='rule',
                severity='medium',
                description=f"Slow response time: {response_time:.1f} min",
                details=value,
                timestamp=np.datetime64('now')
            )
        
        return self.statistical.detect_zscore('driver_response', response_time, threshold=3.0)
    
    def detect(self, metric: str, value: dict) -> Optional[Anomaly]:
        """Run detection on a metric"""
        rule = self.rules.get(metric)
        
        if rule:
            return rule(value)
        
        # Fallback to statistical
        if metric in value:
            self.statistical.add_data(metric, value[metric])
            return self.statistical.detect_zscore(metric, value[metric])
        
        return None
    
    def batch_detect(self, metrics: dict) -> List[Anomaly]:
        """Run detection on multiple metrics"""
        anomalies = []
        
        for metric, value in metrics.items():
            anomaly = self.detect(metric, value)
            if anomaly:
                anomalies.append(anomaly)
        
        return anomalies


class FraudDetector:
    """Specialized fraud detection"""
    
    def __init__(self):
        self.user_profiles: Dict[str, dict] = {}
        
    def analyze_order_pattern(self, order: dict) -> Optional[Anomaly]:
        """Detect suspicious order patterns"""
        warnings = []
        
        # Check order value
        if order.get('total', 0) > 5000:
            warnings.append(f"High value order: R{order['total']}")
        
        # Check item quantity
        item_count = len(order.get('items', []))
        if item_count > 20:
            warnings.append(f"Large order: {item_count} items")
        
        # Check rapid ordering
        last_order_time = self.user_profiles.get(
            order.get('customer_id'),
            {}
        ).get('last_order_time')
        
        if last_order_time:
            time_diff = (order.get('created_at') - last_order_time).total_seconds() / 60
            if time_diff < 5:
                warnings.append(f"Rapid ordering: {time_diff:.0f} min apart")
        
        if warnings:
            return Anomaly(
                id=f"fraud_{order.get('order_id')}",
                type='fraud',
                severity='high',
                description="; ".join(warnings),
                details=order,
                timestamp=np.datetime64('now')
            )
        
        return None


# Global instances
anomaly_detector = AnomalyDetector()
fraud_detector = FraudDetector()