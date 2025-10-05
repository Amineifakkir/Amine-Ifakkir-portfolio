import { Component, OnInit, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {trigger, style, query, transition, stagger, animate } from '@angular/animations'
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { UntypedFormControl } from '@angular/forms';
import { LanguageService } from 'src/app/services/language/language.service';


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



export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {

  responsiveMenuVisible: Boolean = false;
  pageYPosition: number;
  languageFormControl: UntypedFormControl= new UntypedFormControl();
  cvName: string = "";
  activeSection: string = '';
  private intersectionObserver?: IntersectionObserver;

  constructor(
    private router: Router,
    public analyticsService: AnalyticsService,
    public languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.languageFormControl.valueChanges.subscribe(val => this.languageService.changeLanguage(val))
    this.languageFormControl.setValue(this.languageService.language)
  }

  ngAfterViewInit(): void {
    this.initializeScrollSpy();
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  scroll(el) {
    const target = document.querySelector(`[data-anchor="${el}"]`) as HTMLElement || document.getElementById(el);
    if(target) {
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      this.activeSection = el;
    } else{
      this.router.navigate(['/home']).then(()=> {
        const fallback = document.querySelector(`[data-anchor="${el}"]`) as HTMLElement || document.getElementById(el);
        fallback?.scrollIntoView({behavior: 'smooth', block: 'start'});
        this.activeSection = el;
      });
    }
    this.responsiveMenuVisible=false;
  }

  // Méthode pour vérifier si une section est active
  isActive(section: string): boolean {
    return this.activeSection === section;
  }

  private initializeScrollSpy(): void {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-anchor]'));
    if (!targets.length) {
      return;
    }

    this.intersectionObserver?.disconnect();
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const anchor = visible[0].target.getAttribute('data-anchor');
          if (anchor) {
            this.activeSection = anchor;
          }
        }
      },
      {
        root: null,
        threshold: [0.25, 0.5, 0.75],
        rootMargin: '-120px 0px -40px 0px'
      }
    );

    targets.forEach((section) => this.intersectionObserver?.observe(section));
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
