import { Component, OnInit } from '@angular/core';
import { fadeUp, staggerChildren } from 'src/app/animations';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  animations: [fadeUp, staggerChildren]
})
export class ContactComponent implements OnInit {

  constructor(
    public analyticsService: AnalyticsService
  ) { }

  ngOnInit(): void {
  }

  openEmail(): void {
    this.analyticsService.sendAnalyticEvent('click_send_mail', 'contact', 'email');
    window.open('mailto:amineifakkir@hotmail.com', '_blank');
  }

}
