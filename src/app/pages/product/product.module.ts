import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Productomponent } from './product.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';



@NgModule({
  declarations: [
    Productomponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
    RouterModule.forChild([
      { path: '', component: Productomponent }
    ])
  ]
})
export class ProductModule { }
