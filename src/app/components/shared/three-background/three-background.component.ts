import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-background',
  templateUrl: './three-background.component.html',
  styleUrls: ['./three-background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreeBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('backgroundCanvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private starField?: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private neonRings: THREE.Mesh[] = [];
  private animationId?: number;
  private pointer = new THREE.Vector2();

  private readonly resizeHandler = () => this.handleResize();
  private readonly pointerHandler = (event: PointerEvent) => this.handlePointerMove(event);

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      if (!this.initialiseScene()) {
        return;
      }
      this.handleResize();
      window.addEventListener('resize', this.resizeHandler, { passive: true });
      window.addEventListener('pointermove', this.pointerHandler, { passive: true });
      this.animate();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('pointermove', this.pointerHandler);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.disposeScene();
  }

  private initialiseScene(): boolean {
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060a14, 0.0025);

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 2000);
    this.camera.position.set(0, 0, 320);

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
      });
    } catch (error) {
      console.warn('WebGL initialisation failed, disabling ThreeBackgroundComponent.', error);
      canvas.style.display = 'none';
      return false;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    this.renderer.setSize(width, height);
    this.renderer.autoClear = true;
    this.renderer.setClearColor(0x02050c, 0.85);

    this.createStarField();
    this.createNeonRings();
    this.addLights();

    return true;
  }

  private createStarField(): void {
    if (!this.scene) {
      return;
    }

    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 1800;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = THREE.MathUtils.randFloat(80, 600);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0.2, Math.PI - 0.2);
      const index = i * 3;
      positions[index] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index + 1] = radius * Math.cos(phi);
      positions[index + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starsMaterial = new THREE.PointsMaterial({
      size: 2.2,
      depthWrite: false,
      transparent: true,
      opacity: 0.75,
      color: new THREE.Color('#64fff5'),
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.starField = new THREE.Points(starsGeometry, starsMaterial);
    this.starField.rotation.z = Math.PI / 8;
    this.scene.add(this.starField);
  }

  private createNeonRings(): void {
    if (!this.scene) {
      return;
    }

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#7137ff'),
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    const ringGroups: Array<{ inner: number; outer: number; z: number; tilt: number }> = [
      { inner: 120, outer: 130, z: -80, tilt: -0.35 },
      { inner: 180, outer: 194, z: -140, tilt: 0.2 },
      { inner: 240, outer: 255, z: -220, tilt: -0.6 }
    ];

    ringGroups.forEach(({ inner, outer, z, tilt }) => {
      const geometry = new THREE.RingGeometry(inner, outer, 120);
      const mesh = new THREE.Mesh(geometry, ringMaterial.clone());
      mesh.position.set(0, 0, z);
      mesh.rotation.x = tilt;
      mesh.rotation.y = THREE.MathUtils.randFloatSpread(0.4);
      this.scene?.add(mesh);
      this.neonRings.push(mesh);
    });
  }

  private addLights(): void {
    if (!this.scene) {
      return;
    }

    const ambient = new THREE.AmbientLight(0x3a47ff, 0.35);
    this.scene.add(ambient);

    const fill = new THREE.PointLight(0x6df5ff, 1.1, 900, 1.7);
    fill.position.set(-120, 140, 420);
    this.scene.add(fill);

    const rim = new THREE.PointLight(0xff6fcf, 0.9, 700, 1.8);
    rim.position.set(160, -120, 360);
    this.scene.add(rim);
  }

  private animate = (): void => {
    if (!this.scene || !this.camera || !this.renderer) {
      return;
    }

    if (this.starField) {
      this.starField.rotation.y += 0.0008;
      this.starField.rotation.x += 0.0004;
    }

    this.neonRings.forEach((ring, index) => {
      ring.rotation.z += 0.0006 + index * 0.0003;
      ring.material.opacity = 0.25 + Math.sin(Date.now() * 0.001 + index) * 0.1;
    });

    const targetX = this.pointer.x * 22;
    const targetY = this.pointer.y * 12;
    this.camera.position.x += (targetX - this.camera.position.x) * 0.04;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.04;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };

  private handleResize(): void {
    if (!this.camera || !this.renderer) {
      return;
    }
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private handlePointerMove(event: PointerEvent): void {
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;
    this.pointer.x = (event.clientX - halfWidth) / halfWidth;
    this.pointer.y = (halfHeight - event.clientY) / halfHeight;
  }

  private disposeScene(): void {
    this.starField?.geometry.dispose();
    this.starField?.material.dispose();
    this.neonRings.forEach(ring => {
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
    });
    this.renderer?.dispose();
  }
}
