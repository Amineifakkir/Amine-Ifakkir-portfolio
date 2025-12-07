import { Component, Inject, OnInit, Renderer2, RendererFactory2 } from '@angular/core';
import * as AOS from 'aos';
import { Meta, Title } from '@angular/platform-browser';
import { DefaultLangChangeEvent, LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { LanguageService } from 'src/app/services/language/language.service';

type SupportedLanguage = 'en' | 'fr' | 'gr';

interface LanguageMetaConfig {
  locale: string;
  hrefLang: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'amine ifakkir';
  isLoading = true;

  private readonly languageMeta: Record<SupportedLanguage, LanguageMetaConfig> = {
    en: { locale: 'en_US', hrefLang: 'en' },
    fr: { locale: 'fr_FR', hrefLang: 'fr' },
    gr: { locale: 'de_DE', hrefLang: 'de' }
  };

  private readonly supportedLanguages: SupportedLanguage[] = ['en', 'fr', 'gr'];
  private readonly profileImagePath = 'assets/images/me5.webp';
  private readonly structuredDataId = 'structured-data-person';
  private renderer: Renderer2;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private router: Router,
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  ngOnInit(): void {
    this.preloader();
    const initialLanguage = (this.languageService.initLanguage() as SupportedLanguage | undefined) ?? this.detectInitialLanguage();
    this.applySeoForLanguage(initialLanguage);

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.applySeoForLanguage(event.lang as SupportedLanguage);
    });

    this.translateService.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.applySeoForLanguage(event.lang as SupportedLanguage);
    });

    // Update breadcrumbs on route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentLang = (this.translateService.currentLang || 'en') as SupportedLanguage;
        this.updateBreadcrumbs(currentLang);
      }
    });

    AOS.init();
  }

  private preloader(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      }
      if (event instanceof NavigationEnd) {
        this.isLoading = false;
      }
    });
  }

  private detectInitialLanguage(): SupportedLanguage {
    const current = this.translateService.currentLang as SupportedLanguage | undefined;
    return current && this.supportedLanguages.includes(current) ? current : 'en';
  }

  private applySeoForLanguage(lang: SupportedLanguage): void {
    const activeLang = this.supportedLanguages.includes(lang) ? lang : 'en';
    const canonicalUrl = this.buildUrlForLang(activeLang);
    const imageUrl = this.buildAbsoluteUrl(this.profileImagePath);

    this.updateHtmlAttributes(activeLang);
    this.updateCanonicalLinks(activeLang, canonicalUrl);
    this.updateSocialImages(imageUrl);
    this.updateAlternateLocaleMeta(activeLang);

    this.translateService
      .get(['Seo.title', 'Seo.description', 'Seo.keywords', 'Seo.siteName', 'Seo.ogLocale'])
      .subscribe(translations => {
        const title = translations['Seo.title'] || 'Amine Ifakkir | Full-Stack Java & Angular Developer';
        const description =
          translations['Seo.description'] ||
          'Amine Ifakkir is a full-stack developer specialising in Java, Spring Boot, and Angular.';
        const keywords =
          translations['Seo.keywords'] ||
          'Amine Ifakkir, full-stack developer, Java engineer, Angular developer, Spring Boot consultant';
        const siteName = translations['Seo.siteName'] || 'Amine Ifakkir Portfolio';
        const ogLocale = translations['Seo.ogLocale'] || this.languageMeta[activeLang].locale;

        this.titleService.setTitle(title);
        this.updateMetaTag('name', 'title', title);
        this.updateMetaTag('name', 'description', description);
        this.updateMetaTag('name', 'keywords', keywords);
        this.updateMetaTag('name', 'twitter:title', title);
        this.updateMetaTag('name', 'twitter:description', description);

        this.updateMetaTag('property', 'og:title', title);
        this.updateMetaTag('property', 'og:description', description);
        this.updateMetaTag('property', 'og:site_name', siteName);
        this.updateMetaTag('property', 'og:locale', ogLocale);
        this.updateMetaTag('property', 'og:url', canonicalUrl);
        this.updateMetaTag('name', 'twitter:url', canonicalUrl);

        this.updateStructuredData(activeLang, canonicalUrl, imageUrl, description);
      });
  }

  private updateSocialImages(imageUrl: string): void {
    const secureUrl = imageUrl.startsWith('http://')
      ? imageUrl.replace('http://', 'https://')
      : imageUrl;
    this.updateMetaTag('property', 'og:image', secureUrl);
    this.updateMetaTag('property', 'og:image:secure_url', secureUrl);
    this.updateMetaTag('property', 'og:image:alt', 'Portrait of full-stack engineer Amine Ifakkir');
    this.updateMetaTag('name', 'twitter:image', secureUrl);
  }

  private updateCanonicalLinks(lang: SupportedLanguage, canonicalUrl: string): void {
    const canonicalLink = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"][data-dynamic="canonical"]');
    if (canonicalLink) {
      this.renderer.setAttribute(canonicalLink, 'href', canonicalUrl);
    }

    const defaultAlternate = this.document.head.querySelector<HTMLLinkElement>('link[rel="alternate"][data-dynamic="alternate"]');
    if (defaultAlternate) {
      this.renderer.setAttribute(defaultAlternate, 'href', this.buildUrlForLang('en'));
      this.renderer.setAttribute(defaultAlternate, 'hreflang', 'x-default');
    }

    this.supportedLanguages.forEach(code => {
      const link = this.document.head.querySelector<HTMLLinkElement>(`link[rel="alternate"][data-lang="${code}"]`);
      if (link) {
        this.renderer.setAttribute(link, 'href', this.buildUrlForLang(code));
        this.renderer.setAttribute(link, 'hreflang', this.languageMeta[code].hrefLang);
      }
    });

    this.updateMetaTag('property', 'og:url', canonicalUrl);
  }

  private updateHtmlAttributes(lang: SupportedLanguage): void {
    const normalized = lang === 'gr' ? 'de' : lang;
    this.renderer.setAttribute(this.document.documentElement, 'lang', normalized);
    this.renderer.setAttribute(this.document.documentElement, 'dir', 'ltr');
  }

  private updateAlternateLocaleMeta(activeLang: SupportedLanguage): void {
    let alternate = this.metaService.getTag('property="og:locale:alternate"');
    while (alternate) {
      this.metaService.removeTagElement(alternate);
      alternate = this.metaService.getTag('property="og:locale:alternate"');
    }

    this.supportedLanguages
      .filter(code => code !== activeLang)
      .forEach(code => {
        const locale = this.languageMeta[code].locale;
        this.metaService.addTag({ property: 'og:locale:alternate', content: locale }, false);
      });
  }

  private updateStructuredData(
    lang: SupportedLanguage,
    canonicalUrl: string,
    imageUrl: string,
    description: string
  ): void {
    const script = this.document.getElementById(this.structuredDataId) as HTMLScriptElement | null;
    if (!script) {
      return;
    }

    const normalizedLang = lang === 'gr' ? 'de' : lang;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${canonicalUrl}#amine-ifakkir`,
      name: 'Amine Ifakkir',
      url: canonicalUrl,
      jobTitle: 'Full-Stack Java & Angular Developer',
      image: imageUrl,
      description,
      email: 'mailto:amineifakkir@hotmail.com',
      worksFor: {
        '@type': 'Organization',
        name: 'Amine Ifakkir Freelance'
      },
      sameAs: [
        'https://github.com/Amineifakkir',
        'https://www.linkedin.com/in/amine-ifakkir-219094176/'
      ],
      knowsAbout: [
        'Full-Stack Development',
        'Java',
        'Spring Boot',
        'Angular',
        'Microservices',
        'Cloud Architecture',
        'DevOps',
        'REST APIs',
        'PostgreSQL',
        'MongoDB',
        'Docker',
        'Kubernetes',
        'AWS',
        'Azure'
      ],
      knowsLanguage: this.supportedLanguages.map(code => (code === 'gr' ? 'de' : code)),
      inLanguage: normalizedLang,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'MA',
        addressRegion: 'Morocco'
      },
      areaServed: [
        {
          '@type': 'Country',
          name: 'Morocco'
        },
        {
          '@type': 'Country',
          name: 'Germany'
        }
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Software Development Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Java Development',
              description: 'Enterprise Java application development with Spring Boot'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Full-Stack Development',
              description: 'End-to-end web application development with Java and Angular'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Angular Development',
              description: 'Modern Angular applications with RxJS and best practices'
            }
          }
        ]
      }
    };

    script.textContent = JSON.stringify(data);
  }

  private updateMetaTag(attribute: 'name' | 'property', key: string, value: string): void {
    this.metaService.updateTag({ [attribute]: key, content: value });
  }

  private updateBreadcrumbs(lang: SupportedLanguage): void {
    const breadcrumbsId = 'structured-data-breadcrumbs';
    let script = this.document.getElementById(breadcrumbsId) as HTMLScriptElement | null;
    
    if (!script) {
      script = this.renderer.createElement('script');
      script.id = breadcrumbsId;
      script.type = 'application/ld+json';
      this.renderer.appendChild(this.document.head, script);
    }

    const baseUrl = this.getBaseUrl();
    const langPath = lang === 'en' ? '/en' : `/${lang}`;
    const currentPath = this.router.url;
    const isProjectsPage = currentPath.includes('/proyectos');

    const breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${baseUrl}${langPath}`
        }
      ]
    };

    if (isProjectsPage) {
      breadcrumbs.itemListElement.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Projects',
        item: `${baseUrl}${langPath}/proyectos`
      });
    }

    script.textContent = JSON.stringify(breadcrumbs);
  }

  private buildUrlForLang(lang: SupportedLanguage): string {
    const base = this.getBaseUrl();
    const pathSegment = lang === 'en' ? '/en' : `/${lang}`;
    return new URL(pathSegment, base.endsWith('/') ? base : `${base}/`).toString();
  }

  private buildAbsoluteUrl(path: string): string {
    const base = this.getBaseUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return new URL(normalizedPath, base.endsWith('/') ? base : `${base}/`).toString();
  }

  private getBaseUrl(): string {
    const win = this.document.defaultView;
    const origin = win?.location.origin;
    if (!origin) {
      return 'https://amineifakkir.com';
    }
    return origin.endsWith('/') ? origin.slice(0, -1) : origin;
  }
}
