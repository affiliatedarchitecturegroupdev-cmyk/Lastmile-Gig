import { Injectable } from '@nestjs/common';

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol?: number;
  saturatedFat?: number;
}

export interface HealthScore {
  itemId: string;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: { name: string; impact: number }[];
}

@Injectable()
export class NutritionService {
  /**
   * Get nutritional information
   */
  async getNutrition(itemId: string): Promise<NutritionInfo> {
    // Would fetch from database
    return {
      calories: 450,
      protein: 25,
      carbs: 40,
      fat: 22,
      fiber: 3,
      sugar: 5,
      sodium: 680,
      cholesterol: 55,
      saturatedFat: 8,
    };
  }

  /**
   * Calculate health score
   */
  calculateHealthScore(nutrition: NutritionInfo): HealthScore {
    let score = 70;

    // Calorie impact (-10 if high)
    if (nutrition.calories > 600) score -= 10;
    if (nutrition.calories < 400) score += 5;

    // Protein bonus (+10)
    if (nutrition.protein > 20) score += 10;

    // Fat penalty (-10 if high)
    if (nutrition.fat > 30) score -= 10;
    if (nutrition.saturatedFat > 10) score -= 10;

    // Fiber bonus (+10)
    if (nutrition.fiber > 5) score += 10;

    // Sodium penalty (-10 if high)
    if (nutrition.sodium > 800) score -= 10;

    // Sugar penalty (-10)
    if (nutrition.sugar > 15) score -= 10;

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 75) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 40) grade = 'D';
    else grade = 'F';

    return {
      itemId: '',
      score: Math.max(0, Math.min(100, score)),
      grade,
      factors: [
        { name: 'Calorie Control', impact: nutrition.calories > 600 ? -10 : 5 },
        { name: 'Protein', impact: nutrition.protein > 20 ? 10 : 0 },
        { name: 'Fat Content', impact: nutrition.fat > 30 ? -10 : 0 },
        { name: 'Fiber', impact: nutrition.fiber > 5 ? 10 : 0 },
        { name: 'Sodium', impact: nutrition.sodium > 800 ? -10 : 0 },
      ],
    };
  }

  /**
   * Get daily value percentages
   */
  getDailyValues(nutrition: NutritionInfo): Record<string, number> {
    // Based on 2000 calorie diet
    return {
      calories: Math.round((nutrition.calories / 2000) * 100),
      protein: Math.round((nutrition.protein / 50) * 100),
      carbs: Math.round((nutrition.carbs / 300) * 100),
      fat: Math.round((nutrition.fat / 65) * 100),
      fiber: Math.round((nutrition.fiber / 25) * 100),
      sugar: Math.round((nutrition.sugar / 50) * 100),
      sodium: Math.round((nutrition.sodium / 2300) * 100),
    };
  }

  /**
   * Get menu health summary
   */
  async getMenuHealthSummary(items: any[]): Promise<{
    avgHealthScore: number;
    avgGrade: string;
    healthyItems: number;
    unhealthyItems: number;
  }> {
    let totalScore = 0;
    let healthy = 0;
    let unhealthy = 0;

    for (const item of items) {
      const score = Math.floor(Math.random() * 40) + 60;
      totalScore += score;
      if (score >= 70) healthy++;
      else unhealthy++;
    }

    const avgScore = items.length > 0 ? totalScore / items.length : 0;
    const avgGrade = avgScore >= 75 ? 'B' : avgScore >= 60 ? 'C' : 'D';

    return {
      avgHealthScore: Math.round(avgScore),
      avgGrade,
      healthyItems: healthy,
      unhealthyItems: unhealthy,
    };
  }

  /**
   * Generate nutrition label
   */
  async generateLabel(itemId: string): Promise<{
    nutrition: NutritionInfo;
    dailyValues: Record<string, number>;
    healthScore: HealthScore;
  }> {
    const nutrition = await this.getNutrition(itemId);
    const dailyValues = this.getDailyValues(nutrition);
    const healthScore = this.calculateHealthScore(nutrition);

    return { nutrition, dailyValues, healthScore };
  }
}