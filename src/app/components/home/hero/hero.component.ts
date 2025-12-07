import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { fadeIn } from 'src/app/animations';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import * as THREE from 'three';
import { gsap } from 'gsap';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  animations: [fadeIn],
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heroContent', { static: true }) private contentRef!: ElementRef<HTMLDivElement>;

  private renderer?: THREE.WebGLRenderer;
  // expose to template so we can show a fallback when WebGL is not available
  public webglAvailable = true;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private torus?: THREE.Mesh;
  private animationId?: number;
  private clock = new THREE.Clock();
  private pointer = new THREE.Vector2(0, 0);
  private readonly pointerHandler = (event: PointerEvent) => this.handlePointerMove(event);

  private readonly handleResize = () => {
    if (!this.camera || !this.renderer) {
      return;
    }
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  constructor(private readonly analyticsService: AnalyticsService) {}

  ngAfterViewInit(): void {
    this.setupScene();
    if (this.webglAvailable) {
      this.startAnimationLoop();
      window.addEventListener('pointermove', this.pointerHandler, { passive: true });
    }
    this.animateContent();
    window.addEventListener('resize', this.handleResize, { passive: true });
    this.handleResize();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
    if (this.webglAvailable) {
      window.removeEventListener('pointermove', this.pointerHandler);
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer?.dispose();
    if (this.torus) {
      (this.torus.geometry as THREE.BufferGeometry).dispose();
      (this.torus.material as THREE.Material).dispose();
    }
  }

  openEmail(): void {
    this.analyticsService.sendAnalyticEvent('click_send_mail', 'hero', 'email');
    window.open('mailto:amineifakkir@hotmail.com', '_blank');
  }

  scrollToWork(): void {
    const section = document.querySelector('[data-anchor="tech"]');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private setupScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 35);

    // Try to create a WebGL renderer. If it fails, gracefully fallback.
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
    } catch (err) {
      // WebGL context couldn't be created (headless environment, blocked, or driver issues)
      // Mark as unavailable and hide the canvas to avoid further errors.
      // eslint-disable-next-line no-console
      console.warn('WebGL not available, disabling 3D scene fallback.', err);
      this.webglAvailable = false;
      try {
        canvas.style.display = 'none';
      } catch (e) {
        // ignore
      }
      return;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);

    const geometry = new THREE.TorusKnotGeometry(10, 3.2, 160, 32);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#00ffe0'),
      emissive: new THREE.Color('#003838'),
      metalness: 0.85,
      roughness: 0.25,
      side: THREE.DoubleSide,
    });
    this.torus = new THREE.Mesh(geometry, material);
    this.scene.add(this.torus);

    const pointLight = new THREE.PointLight(0xffffff, 1.1, 200);
    pointLight.position.set(18, 16, 24);
    this.scene.add(pointLight);

    const accentLight = new THREE.PointLight(0xff6bcb, 0.6, 180);
    accentLight.position.set(-24, -18, -20);
    this.scene.add(accentLight);

    const rimLight = new THREE.PointLight(0x5b7bff, 0.35, 220);
    rimLight.position.set(-10, 22, 30);
    this.scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0x222222, 1.2);
    this.scene.add(ambient);
  }

  private startAnimationLoop(): void {
    // Do not start the loop if WebGL is not available
    if (!this.webglAvailable || !this.renderer) {
      return;
    }

    const animate = () => {
      if (!this.scene || !this.camera || !this.renderer || !this.torus) {
        return;
      }
      const elapsed = this.clock.getElapsedTime();
      const pointerInfluenceX = this.pointer.x * 0.5;
      const pointerInfluenceY = this.pointer.y * 0.5;

      this.torus.rotation.x = elapsed * 0.32 + pointerInfluenceY;
      this.torus.rotation.y = elapsed * 0.26 + pointerInfluenceX;
      this.torus.rotation.z = elapsed * 0.18;
      this.torus.position.x = THREE.MathUtils.lerp(this.torus.position.x, pointerInfluenceX * 7.5, 0.08);
      this.torus.position.y = THREE.MathUtils.lerp(this.torus.position.y, pointerInfluenceY * 5.5, 0.08);

      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, pointerInfluenceX * 6, 0.06);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, pointerInfluenceY * 4, 0.06);
      this.camera.lookAt(0, 0, 0);
      this.animationId = requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  private animateContent(): void {
    if (!this.contentRef) {
      return;
    }

    gsap.fromTo(
      this.contentRef.nativeElement.children,
      {
        opacity: 0,
        y: 40,
        filter: 'blur(6px)',
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.3,
        ease: 'power4.out',
        stagger: 0.12,
        delay: 0.2,
      }
    );
  }

  private handlePointerMove(event: PointerEvent): void {
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;
    this.pointer.x = (event.clientX - halfWidth) / halfWidth;
    this.pointer.y = (halfHeight - event.clientY) / halfHeight;
  }
}
