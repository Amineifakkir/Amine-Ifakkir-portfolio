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
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private torus?: THREE.Mesh;
  private animationId?: number;

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
    this.startAnimationLoop();
    this.animateContent();
    window.addEventListener('resize', this.handleResize, { passive: true });
    this.handleResize();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
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
    const section = document.querySelector('[data-anchor="tech-stack"]');
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

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
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
    const animate = () => {
      if (!this.scene || !this.camera || !this.renderer || !this.torus) {
        return;
      }
      this.torus.rotation.x += 0.01;
      this.torus.rotation.y += 0.008;
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
}
