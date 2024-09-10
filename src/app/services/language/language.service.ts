import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  language: "en" | "fr" | "gr";

  constructor(
    public translateService: TranslateService,
    private location: Location,
  ) {}

  initLanguage(){
    this.translateService.addLangs(["en", "fr", "gr"]);
    let language = navigator.language || (navigator as any).userLanguage;
    language = language.split("-").includes("fr") ? "fr" : "en"
    this.translateService.setDefaultLang(language)

    // Change the URL without navigate:
    this.location.go(language)

    this.language=language
  }

  changeLanguage(language){
    this.translateService.setDefaultLang(language)
    this.location.go(language)
    this.language=language
  }
}
