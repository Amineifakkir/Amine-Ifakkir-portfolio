import { Component } from '@angular/core';
import { fadeUp, staggerChildren } from 'src/app/animations';

@Component({
  selector: 'app-tech-stack',
  templateUrl: './tech-stack.component.html',
  styleUrls: ['./tech-stack.component.scss'],
  animations: [fadeUp, staggerChildren],
})
export class TechStackComponent {}
