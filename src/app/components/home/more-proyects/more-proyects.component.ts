import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { fadeUp, staggerChildren } from 'src/app/animations';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-more-proyects',
  templateUrl: './more-proyects.component.html',
  styleUrls: ['./more-proyects.component.scss'],
  animations: [fadeUp, staggerChildren]
})
export class MoreProyectsComponent implements OnInit {

  constructor(
    private router: Router,
    public analyticsService: AnalyticsService
    ) { }

    ngOnInit() {
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0)
        });
    }
    redirect(route: string | undefined, event: Event) {
      if (!route) {
        return;
      }
      const target = event.target as HTMLElement;
      if (target.closest('a')) {
        return;
      }
      window.open(route, '_blank');
    }

}
