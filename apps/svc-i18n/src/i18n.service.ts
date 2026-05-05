import { Injectable } from '@nestjs/common';

export type SupportedLocale = 'en' | 'af' | 'zu' | 'xh' | 'ts' | 'st' | 'nso' | 'tn' | 've' | 'ss' | 'ts' | ' Pedi' | 'lo';

export interface LanguageConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  rtl: boolean;
  active: boolean;
}

@Injectable()
export class I18nService {
  private defaultLocale: SupportedLocale = 'en';
  private userLocales: Map<string, SupportedLocale> = new Map();

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<LanguageConfig[]> {
    return [
      { code: 'en', name: 'English', nativeName: 'English', rtl: false, active: true },
      { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', rtl: false, active: true },
      { code: 'zu', name: 'Zulu', nativeName: 'Zulu', nativeName: 'isiZulu', rtl: false, active: true },
      { code: 'xh', name: 'Xhosa', nativeName: 'Xhosa', nativeName: 'isiXhosa', rtl: false, active: true },
      { code: 'st', name: 'Sesotho', nativeName: 'Sesotho', nativeName: 'Sesotho', rtl: false, active: true },
      { code: 'tn', name: 'Tswana', nativeName: 'Tswana', nativeName: 'Setswana', rtl: false, active: true },
    ];
  }

  /**
   * Set user locale
   */
  async setUserLocale(userId: string, locale: SupportedLocale): Promise<void> {
    this.userLocales.set(userId, locale);
  }

  /**
   * Get user locale
   */
  async getUserLocale(userId: string): Promise<SupportedLocale> {
    return this.userLocales.get(userId) || this.defaultLocale;
  }

  /**
   * Detect user language
   */
  async detectLanguage(acceptLanguage?: string): Promise<SupportedLocale> {
    if (!acceptLanguage) return this.defaultLocale;

    // Parse Accept-Language header
    const langs = acceptLanguage.split(',').map(l => l.split(';')[0].trim());
    
    for (const lang of langs) {
      const code = lang.split('-')[0].toLowerCase();
      const supported = await this.getSupportedLanguages();
      if (supported.find(s => s.code === code)) {
        return code as SupportedLocale;
      }
    }

    return this.defaultLocale;
  }

  /**
   * Check RTL
   */
  async isRTL(locale: SupportedLocale): Promise<boolean> {
    const langs = await this.getSupportedLanguages();
    const lang = langs.find(l => l.code === locale);
    return lang?.rtl || false;
  }

  /**
   * Get all locales
   */
  async getAllLocales(): Promise<string[]> {
    return ['en', 'af', 'zu', 'xh', 'st', 'tn'];
  }

  /**
   * Get language by code
   */
  async getLanguageByCode(code: string): Promise<LanguageConfig | null> {
    const langs = await this.getSupportedLanguages();
    return langs.find(l => l.code === code) || null;
  }

  /**
   * Set default locale
   */
  async setDefaultLocale(locale: SupportedLocale): Promise<void> {
    this.defaultLocale = locale;
  }

  /**
   * Get default locale
   */
  async getDefaultLocale(): Promise<SupportedLocale> {
    return this.defaultLocale;
  }
}