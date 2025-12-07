import { Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTilt3d]'
})
export class Tilt3dDirective implements OnInit, OnDestroy {
  @Input() appTilt3d = 8;
  @Input() appTilt3dScale = 1.04;
  @Input() appTilt3dPerspective = 960;

  private readonly element: HTMLElement;
  private pointerMoveRef?: (event: PointerEvent) => void;
  private pointerLeaveRef?: () => void;
  private readonly canTilt: boolean = typeof window !== 'undefined'
    ? window.matchMedia('(pointer: fine)').matches
    : false;

  constructor(
    elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    private readonly ngZone: NgZone
  ) {
    this.element = elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.applyBaseStyles();
    if (!this.canTilt) {
      this.renderer.setStyle(
        this.element,
        'transform',
        `perspective(${this.appTilt3dPerspective}px)`
      );
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.pointerMoveRef = (event: PointerEvent) => this.handlePointerMove(event);
      this.pointerLeaveRef = () => this.resetTilt();
      this.element.addEventListener('pointermove', this.pointerMoveRef, { passive: true });
      this.element.addEventListener('pointerleave', this.pointerLeaveRef, { passive: true });
      this.element.addEventListener('pointerup', this.pointerLeaveRef, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.pointerMoveRef) {
      this.element.removeEventListener('pointermove', this.pointerMoveRef);
    }
    if (this.pointerLeaveRef) {
      this.element.removeEventListener('pointerleave', this.pointerLeaveRef);
      this.element.removeEventListener('pointerup', this.pointerLeaveRef);
    }
  }

  private applyBaseStyles(): void {
    this.renderer.setStyle(this.element, 'transformStyle', 'preserve-3d');
    this.renderer.setStyle(this.element, 'willChange', 'transform');
    this.renderer.setStyle(
      this.element,
      'transition',
      'transform 280ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 320ms ease'
    );
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!this.canTilt) {
      return;
    }
    const rect = this.element.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    const rotateY = this.clamp(-relativeX * this.appTilt3d * 2, -this.appTilt3d, this.appTilt3d);
    const rotateX = this.clamp(relativeY * this.appTilt3d * 2, -this.appTilt3d, this.appTilt3d);

    const scale = this.appTilt3dScale;
    const perspective = this.appTilt3dPerspective;

    this.renderer.setStyle(
      this.element,
      'transform',
      `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
    );
  }

  private resetTilt(): void {
    this.renderer.setStyle(
      this.element,
      'transform',
      `perspective(${this.appTilt3dPerspective}px) rotateX(0deg) rotateY(0deg) scale(1)`
    );
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
