import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

type SupportedLanguage = 'en' | 'fr' | 'gr';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  language: SupportedLanguage;

  constructor(
    public translateService: TranslateService,
    private location: Location,
  ) {}

  initLanguage(): SupportedLanguage {
    const languages: SupportedLanguage[] = ['en', 'fr', 'gr'];
    this.translateService.addLangs(languages);

    const navigatorLanguage: string =
      (navigator.language || (navigator as any).userLanguage || 'en').toLowerCase();

    let language: SupportedLanguage = 'en';
    if (navigatorLanguage.startsWith('fr')) {
      language = 'fr';
    } else if (navigatorLanguage.startsWith('de')) {
      language = 'gr';
    }

    this.translateService.setDefaultLang(language);
    this.translateService.use(language);
    this.location.go(language);

    this.language = language;
    return language;
  }

  changeLanguage(language: SupportedLanguage): SupportedLanguage {
    const fallback: SupportedLanguage = ['en', 'fr', 'gr'].includes(language) ? language : 'en';
    this.translateService.setDefaultLang(fallback);
    this.translateService.use(fallback);
    this.location.go(fallback);
    this.language = fallback;
    return this.language;
  }
}
