import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(30px)' }),
    animate('800ms cubic-bezier(0.25, 1, 0.5, 1)', style({ opacity: 1, transform: 'none' }))
  ])
]);

export const fadeUp = trigger('fadeUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('600ms ease-out', style({ opacity: 1, transform: 'none' }))
  ])
]);

export const staggerChildren = trigger('staggerChildren', [
  transition(':enter', [
    // Use :scope > * to target direct children of the element in a valid selector
    query(':scope > *', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      stagger(100, [
        animate('320ms ease-out', style({ opacity: 1, transform: 'none' }))
      ])
    ], { optional: true })
  ])
]);
