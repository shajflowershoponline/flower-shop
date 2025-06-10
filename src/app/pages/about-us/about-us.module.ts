import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutUsComponent } from './about-us.component';
import { RouterModule } from '@angular/router';
import { HistoryComponent } from './history/history.component';
import { FeaturedProductComponent } from 'src/app/shared/featured-product/featured-product.component';



@NgModule({
  declarations: [
    AboutUsComponent
  ],
  imports: [
    CommonModule,
    FeaturedProductComponent,
    HistoryComponent,
    RouterModule.forChild([
      { path: '', component: AboutUsComponent }
    ])
  ]
})
export class AboutUsModule { }
