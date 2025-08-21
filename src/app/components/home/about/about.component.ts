import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  imageError: boolean = false;

  constructor(
    public analyticsService: AnalyticsService
  ) { }

  ngOnInit(): void {
  }
  
  // Méthode pour gérer les erreurs d'image
  handleImageError(event: any): void {
    this.imageError = true;
    event.target.style.display = 'none';
  }
  
  // Méthode pour vérifier si l'image existe
  imageExists(): boolean {
    return !this.imageError;
  }
}
