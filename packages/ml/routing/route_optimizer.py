"""
Route Optimization - Multi-stop routing and delivery sequencing
Uses algorithms to find optimal delivery routes
"""

import math
import heapq
from dataclasses import dataclass
from typing import List, Tuple, Optional
import numpy as np

@dataclass
class Location:
    """Geographic location"""
    lat: float
    lng: float
    address: str = ""
    id: str = ""

@dataclass
class RouteStop:
    """A stop in the delivery route"""
    location: Location
    order_id: str
    priority: int = 0  # 0=normal, 1=high
    time_window_start: Optional[int] = None  # minutes from midnight
    time_window_end: Optional[int] = None
    service_time: int = 3  # minutes to complete delivery
    
class Route:
    """Optimized delivery route"""
    stops: List[RouteStop]
    total_distance_km: float
    estimated_duration_minutes: float
    path: List[Location]
    
class RouteOptimizer:
    """Multi-stop route optimization using nearest neighbor + 2-opt improvement"""
    
    def __init__(self):
        self.depot: Optional[Location] = None
        
    def set_depot(self, location: Location):
        """Set the depot/warehouse location"""
        self.depot = location
        
    def optimize_route(
        self,
        stops: List[RouteStop],
        max_distance: Optional[float] = None,
        max_duration: Optional[float] = None
    ) -> Route:
        """Optimize delivery route using nearest neighbor heuristic"""
        if not stops:
            raise ValueError("No stops provided")
        if not self.depot:
            raise ValueError("Depot not set")
            
        # Handle single stop
        if len(stops) == 1:
            path = [self.depot, stops[0].location, self.depot]
            return Route(
                stops=stops,
                total_distance_km=self._calc_path_distance(path),
                estimated_duration_minutes=self._calc_duration(path, stops),
                path=path
            )
        
        # Sort by priority first, then use nearest neighbor
        sorted_stops = sorted(stops, key=lambda s: (-s.priority, s.time_window_start or 0))
        
        # Build route using nearest neighbor
        route = [self.depot]
        remaining = sorted_stops.copy()
        
        while remaining and (max_distance or max_duration):
            current = route[-1]
            nearest = min(
                remaining,
                key=lambda s: self._distance(current.location, s.location)
            )
            route.append(nearest.location)
            remaining.remove(nearest)
        
        # Return to depot
        route.append(self.depot)
        
        # 2-opt improvement
        route = self._two_opt_improvement(route, stops)
        
        return Route(
            stops=stops,
            total_distance_km=self._calc_path_distance(route),
            estimated_duration_minutes=self._calc_duration(route, stops),
            path=route
        )
    
    def _distance(self, a: Location, b: Location) -> float:
        """Calculate distance between two locations"""
        return self._haversine_distance(a.lat, a.lng, b.lat, b.lng)
    
    def _haversine_distance(
        self,
        lat1: float, lng1: float,
        lat2: float, lng2: float
    ) -> float:
        """Calculate distance using Haversine formula"""
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(dlng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def _calc_path_distance(self, path: List[Location]) -> float:
        """Calculate total path distance"""
        total = 0
        for i in range(len(path) - 1):
            total += self._distance(path[i], path[i + 1])
        return total
    
    def _calc_duration(
        self,
        path: List[Location],
        stops: List[RouteStop]
    ) -> float:
        """Estimate total duration in minutes"""
        # Travel time: average 30 km/h in city
        travel_time = self._calc_path_distance(path) / 30 * 60
        
        # Service time per stop
        service_time = sum(s.service_time for s in stops)
        
        return travel_time + service_time
    
    def _two_opt_improvement(
        self,
        route: List[Location],
        stops: List[RouteStop]
    ) -> List[Location]:
        """2-opt local search improvement"""
        improved = True
        best_route = route.copy()
        
        while improved:
            improved = False
            for i in range(1, len(best_route) - 2):
                for j in range(i + 1, len(best_route) - 1):
                    new_route = self._swap_2opt(best_route, i, j)
                    
                    dist_old = self._calc_path_distance(best_route)
                    dist_new = self._calc_path_distance(new_route)
                    
                    if dist_new < dist_old:
                        best_route = new_route
                        improved = True
                        break
                if improved:
                    break
        
        return best_route
    
    def _swap_2opt(
        self,
        route: List[Location],
        i: int,
        j: int
    ) -> List[Location]:
        """Perform 2-opt swap"""
        new_route = route[:i]
        new_route.extend(reversed(route[i:j + 1]))
        new_route.extend(route[j + 1:])
        return new_route
    
    def batch_optimize(
        self,
        all_stops: List[RouteStop],
        max_stops_per_route: int = 10
    ) -> List[Route]:
        """Optimize multiple routes for batch delivery"""
        # Sort by location clustering
        clusters = self._cluster_locations(all_stops)
        
        routes = []
        for cluster in clusters:
            if len(cluster) <= max_stops_per_route:
                route = self.optimize_route(cluster)
                routes.append(route)
            else:
                # Split into multiple routes
                for i in range(0, len(cluster), max_stops_per_route):
                    chunk = cluster[i:i + max_stops_per_route]
                    if chunk:
                        route = self.optimize_route(chunk)
                        routes.append(route)
        
        return routes
    
    def _cluster_locations(
        self,
        stops: List[RouteStop]
    ) -> List[List[RouteStop]]:
        """Cluster stops by geographic proximity"""
        if not stops:
            return []
        
        clusters = []
        
        while stops:
            # Find centroid of remaining stops
            if not stops:
                break
                
            base = stops[0]
            cluster = [base]
            remaining = stops[1:]
            
            for stop in remaining[:]:
                if self._distance(base.location, stop.location) < 3:  # Within 3km
                    cluster.append(stop)
                    remaining.remove(stop)
            
            clusters.append(cluster)
            stops = remaining
        
        return sorted(clusters, key=lambda c: len(c), reverse=True)


def calculate_eta(
    current_location: Location,
    destination: Location,
    avg_speed_kmh: float = 30
) -> float:
    """Calculate estimated time of arrival"""
    optimizer = RouteOptimizer()
    distance = optimizer._distance(current_location, destination)
    return (distance / avg_speed_kmh) * 60  # minutes


def rebalance_for_zone(
    drivers: List[dict],
    zone_centers: List[Location],
    target_per_zone: int
) -> dict:
    """Rebalance driver distribution across zones"""
    assignments = {}
    
    for zone_idx, zone_center in enumerate(zone_centers):
        zone_drivers = []
        
        for driver in drivers:
            dist = calculate_eta(
                Location(driver['lat'], driver['lng']),
                zone_center
            )
            zone_drivers.append((driver['id'], dist))
        
        # Assign closest drivers to meet target
        zone_drivers.sort(key=lambda x: x[1])
        for driver_id, _ in zone_drivers[:target_per_zone]:
            assignments[driver_id] = zone_idx
    
    return assignments