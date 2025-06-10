import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComponent } from './checkout.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationMapViewerComponent } from 'src/app/shared/location-map-viewer/location-map-viewer.component';
import { LocationPickerComponent } from 'src/app/shared/location-picker/location-picker.component';



@NgModule({
  declarations: [
    CheckoutComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LocationMapViewerComponent,
    LocationPickerComponent,
    RouterModule.forChild([
      { path: '', component: CheckoutComponent }
    ])
  ]
})
export class CheckoutModule { }
