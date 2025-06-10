import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutUsComponent } from './about-us.component';
import { RouterModule } from '@angular/router';
import { HistoryComponent } from './history/history.component';



@NgModule({
  declarations: [
    AboutUsComponent
  ],
  imports: [
    CommonModule,
    HistoryComponent,
    RouterModule.forChild([
      { path: '', component: AboutUsComponent }
    ])
  ]
})
export class AboutUsModule { }
