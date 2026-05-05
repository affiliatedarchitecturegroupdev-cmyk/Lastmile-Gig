import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  async search(query: string, filters?: { cuisine?: string; priceRange?: string; rating?: number }): Promise<{ results: any[]; total: number }> {
    return { results: [{ id: 'r1', name: 'Restaurant A', cuisine: 'Pizza', rating: 4.5 }], total: 1 };
  }

  async suggestSearches(query: string): Promise<string[]> { return ['pizza', 'burgers', 'sushi']; }
  async getPopularSearches(): Promise<{ query: string; count: number }[]> { return [{ query: 'pizza', count: 1500 }]; }
  async getTrending(): Promise<{ id: string; name: string; trend: number }[]> { return [{ id: 'r1', name: 'Trending Restaurant', trend: 25 }]; }
}