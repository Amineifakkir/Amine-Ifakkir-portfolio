import { Component, OnInit } from '@angular/core';
import { fadeUp, staggerChildren } from 'src/app/animations';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
  animations: [fadeUp, staggerChildren]
})
export class JobsComponent implements OnInit {
  
  active = 0
  
  constructor(
    public analyticsService: AnalyticsService
  ) { }

  ngOnInit(): void {
  }

}
