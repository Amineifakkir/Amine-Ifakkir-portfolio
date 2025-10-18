import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Tilt3dDirective } from './directives/tilt-3d.directive';

@NgModule({
  declarations: [Tilt3dDirective],
  imports: [CommonModule],
  exports: [Tilt3dDirective]
})
export class SharedModule {}
