import { Component, OnInit, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import {trigger, style, query, transition, stagger, animate } from '@angular/animations'
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormControl } from '@angular/forms';
import { LanguageService } from 'src/app/services/language/language.service';
import { ThisReceiver } from '@angular/compiler';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations:[
    trigger("animateMenu",[
      transition(":enter",[
        query("*", [
          style({opacity: 0, transform: "translateY(-50%)"}),
          stagger(50,[
            animate(
              "250ms cubic-bezier(0.35, 0, 0.25, 1)",
              style({opacity: 1, transform: "none"}))
          ])
        ])
      ])
    ])
  ]
})



export class HeaderComponent implements OnInit {

  responsiveMenuVisible: Boolean = false;
  pageYPosition: number;
  languageFormControl: UntypedFormControl= new UntypedFormControl();
  cvName: string = "";
  activeSection: string = '';

  constructor(
    private router: Router,
    public analyticsService: AnalyticsService,
    public languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.languageFormControl.valueChanges.subscribe(val => this.languageService.changeLanguage(val))
    this.languageFormControl.setValue(this.languageService.language)
    
    // Initialiser la détection de section active
    this.checkActiveSection();
  }

  scroll(el) {
    if(document.getElementById(el)) {
      document.getElementById(el).scrollIntoView({behavior: 'smooth'});
      this.activeSection = el; // Mettre à jour la section active
    } else{
      this.router.navigate(['/home']).then(()=> document.getElementById(el).scrollIntoView({behavior: 'smooth'}) );
      this.activeSection = el; // Mettre à jour la section active
    }
    this.responsiveMenuVisible=false;
  }

  // Méthode pour vérifier la section active en fonction du défilement
  checkActiveSection() {
    const sections = ['about', 'jobs', 'more-proyects', 'contact'];
    
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY + 100; // Ajouter une marge pour la navbar
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            this.activeSection = section;
            break;
          }
        }
      }
    });
  }

  // Méthode pour vérifier si une section est active
  isActive(section: string): boolean {
    return this.activeSection === section;
  }

  downloadCV(){
    this.languageService.translateService.get("Header.cvName").subscribe(val => {
      this.cvName = val
      console.log(val)
      // app url
      let url = window.location.href;

      // Open a new window with the CV
      window.open(url + "/../assets/cv/" + this.cvName, "_blank");
    })

  }

  downloadCVConst(){
    let link = document.createElement ("a");
    link. download = "Amine-IFAKKIR.pdf";
    link.href = "assets/cv/Amine-IFAKKIR.pdf* ";
    link.click();
  }
  @HostListener('window:scroll', ['getScrollPosition($event)'])
    getScrollPosition(event) {
        this.pageYPosition=window.pageYOffset
    }

    changeLanguage(language: string) {
      this.languageFormControl.setValue(language);
    }
}
