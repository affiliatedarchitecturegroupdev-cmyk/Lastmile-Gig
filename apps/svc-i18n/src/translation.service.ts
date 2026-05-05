import { Injectable } from '@nestjs/common';

export interface Translation {
  key: string;
  translations: Record<string, string>;
}

@Injectable()
export class TranslationService {
  private translations: Map<string, Translation> = new Map();

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    // Common UI translations
    const common: Translation[] = [
      { key: 'welcome', translations: { en: 'Welcome', af: 'Welkom', zu: 'Siyakwemukela', xh: 'Wamkela' } },
      { key: 'search', translations: { en: 'Search', af: 'Soek', zu: 'Sesha', xh: 'Ukukhangela' } },
      { key: 'menu', translations: { en: 'Menu', af: 'Menu', zu: 'Imenyu', xh: 'Imenyu' } },
      { key: 'orders', translations: { en: 'Orders', af: 'Bestellings', zu: 'Oda', xh: 'Iiolandelana' } },
      { key: 'account', translations: { en: 'Account', af: 'Rekening', zu: 'Akaunti', xh: 'Iakhawunti' } },
      { key: 'cart', translations: { en: 'Cart', af: 'Mandjie', ze: 'Ikhekhe', xh: 'Ikhekhe' } },
      { key: 'checkout', translations: { en: 'Checkout', af: 'Kassa', zu: 'Ukukhokha', xh: 'Ikhasi' } },
      { key: 'deliver', translations: { en: 'Deliver', af: 'Aflewer', zu: 'Thumela', xh: 'Ngenisa' } },
      { key: 'track', translations: { en: 'Track', af: 'Volg',zu: 'Landela', xh: 'Landela' } },
      { key: 'profile', translations: { en: 'Profile', af: 'Profiel', zu: 'Iprofiles', xh: 'Iprofili' } },
      { key: 'settings', translations: { en: 'Settings', af: 'Stellings', izul: 'Izilungiselelo', xh: 'Izicwangciso' } },
      { key: 'help', translations: { en: 'Help', af: 'Help', zu: 'Usizo', xh: 'Uncedo' } },
    ];

    for (const t of common) {
      this.translations.set(t.key, t);
    }
  }

  /**
   * Translate key
   */
  async translate(key: string, locale: string): Promise<string> {
    const translation = this.translations.get(key);
    if (!translation) return key;

    return translation.translations[locale] || translation.translations['en'] || key;
  }

  /**
   * Translate multiple keys
   */
  async translateMultiple(keys: string[], locale: string): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    for (const key of keys) {
      results[key] = await this.translate(key, locale);
    }

    return results;
  }

  /**
   * Get all translations for locale
   */
  async getTranslationsForLocale(locale: string): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    for (const [key, translation] of this.translations.entries()) {
      results[key] = translation.translations[locale] || translation.translations['en'] || key;
    }

    return results;
  }

  /**
   * Add translation
   */
  async addTranslation(translation: Translation): Promise<void> {
    const existing = this.translations.get(translation.key);
    if (existing) {
      existing.translations = { ...existing.translations, ...translation.translations };
    } else {
      this.translations.set(translation.key, translation);
    }
  }

  /**
   * Get translation keys
   */
  async getTranslationKeys(): Promise<string[]> {
    return Array.from(this.translations.keys());
  }

  /**
   * Fallback translations
   */
  async getFallbackChain(locale: string): Promise<string[]> {
    const chain = [locale];
    
    if (locale.includes('-')) {
      chain.push(locale.split('-')[0]);
    }
    
    if (!chain.includes('en')) {
      chain.push('en');
    }
    
    return chain;
  }
}