import { Component, OnInit } from '@angular/core';
import * as AOS from 'aos';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import {LanguageService} from "src/app/services/language/language.service"
import { Location } from '@angular/common';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'amine ifakkir';
  isLoading: boolean = true;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private translateService: TranslateService,
    private location: Location,
    private languageService: LanguageService,
    private router:Router
    ){
    }
  ngOnInit(): void{
    this.preloader();
    this.languageService.initLanguage()

    this.titleService.setTitle( "Amine Ifakkir | Full-stack Developer" );

    this.metaService.addTags([
      {name: 'keywords', content: 'Full-stack developer, software, developer'},
      {name: 'description', content: 'Amine Ifakkir is a full-stack developer with a passion for creating software that is both beautiful and functional.'},]);
    
    
    AOS.init(); 

  }

  preloader(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true; // Show preloader
      }
      if (event instanceof NavigationEnd) {
        this.isLoading = false; // Hide preloader after route change
      }
    });
  }
}
