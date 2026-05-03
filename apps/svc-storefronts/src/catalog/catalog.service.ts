import { Injectable, NotFoundException } from '@nestjs/common';

export interface Category {
  id: string;
  storefrontId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CatalogService {
  private categories: Map<string, Category> = new Map();

  async createCategory(storefrontId: string, dto: any): Promise<Category> {
    const category: Category = {
      id: crypto.randomUUID(),
      storefrontId,
      name: dto.name,
      description: dto.description || null,
      sortOrder: dto.sortOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async getCategories(storefrontId: string): Promise<Category[]> {
    return Array.from(this.categories.values())
      .filter(c => c.storefrontId === storefrontId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getCategory(id: string): Promise<Category> {
    const category = this.categories.get(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async updateCategory(id: string, dto: any): Promise<Category> {
    const category = await this.getCategory(id);
    if (dto.name) category.name = dto.name;
    if (dto.description) category.description = dto.description;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    category.updatedAt = new Date();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    this.categories.delete(id);
  }
}