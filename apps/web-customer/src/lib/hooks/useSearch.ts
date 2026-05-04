'use client';

export interface RestaurantFilter {
  cuisine?: string[];
  rating?: number;
  deliveryTime?: number;
  priceRange?: string;
  dietary?: string[];
  features?: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  priceRange: string;
  image: string;
  isOpen: boolean;
}

const mockRestaurants: Restaurant[] = [
  { id: '1', name: 'Burger Palace', cuisine: 'Burgers', rating: 4.5, deliveryTime: 25, priceRange: '$$', image: '', isOpen: true },
  { id: '2', name: 'Pizza Express', cuisine: 'Pizza', rating: 4.8, deliveryTime: 20, priceRange: '$$', image: '', isOpen: true },
  { id: '3', name: 'Sushi Master', cuisine: 'Sushi', rating: 4.7, deliveryTime: 30, priceRange: '$$$', image: '', isOpen: true },
  { id: '4', name: 'Taco Fiesta', cuisine: 'Mexican', rating: 4.3, deliveryTime: 25, priceRange: '$', image: '', isOpen: true },
];

export function useSearch() {
  let restaurants = [...mockRestaurants];
  const filter: RestaurantFilter = {};
  let sortBy: 'rating' | 'delivery' | 'price' = 'rating';

  const setFilter = (newFilter: RestaurantFilter) => {
    Object.assign(filter, newFilter);
    applyFilter();
  };

  const setSort = (sort: 'rating' | 'delivery' | 'price') => {
    sortBy = sort;
    applyFilter();
  };

  const search = (query: string) => {
    if (!query) return mockRestaurants;
    const q = query.toLowerCase();
    return mockRestaurants.filter(r => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
  };

  const applyFilter = () => {
    if (filter.cuisine?.length) {
      restaurants = restaurants.filter(r => filter.cuisine.includes(r.cuisine));
    }
    if (filter.rating) {
      restaurants = restaurants.filter(r => r.rating >= filter.rating);
    }
    if (filter.deliveryTime) {
      restaurants = restaurants.filter(r => r.deliveryTime <= filter.deliveryTime);
    }

    switch (sortBy) {
      case 'rating':
        restaurants.sort((a, b) => b.rating - a.rating);
        break;
      case 'delivery':
        restaurants.sort((a, b) => a.deliveryTime - b.deliveryTime);
        break;
      case 'price':
        restaurants.sort((a, b) => a.priceRange.localeCompare(b.priceRange));
        break;
    }
  };

  return { restaurants, setFilter, setSort, search };
}