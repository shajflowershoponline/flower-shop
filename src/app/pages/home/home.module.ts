import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { HistoryComponent } from '../about-us/history/history.component';
import { FeaturedProductComponent } from 'src/app/shared/featured-product/featured-product.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    FeaturedProductComponent,
    HistoryComponent,
    RouterModule.forChild([
      { path: '', component: HomeComponent }
    ])
  ]
})
export class HomeModule { }
