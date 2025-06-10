import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuickProductViewModalComponent } from 'src/app/shared/quick-product-view-modal/quick-product-view-modal.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';



@NgModule({
  declarations: [
    SearchComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuickProductViewModalComponent,
    NgxSkeletonLoaderModule,
    RouterModule.forChild([
      { path: '', component: SearchComponent }
    ])
  ]
})
export class SearchModule { }
