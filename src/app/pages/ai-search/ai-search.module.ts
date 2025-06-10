import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AISearchComponent } from './ai-search.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    AISearchComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: AISearchComponent }
    ])
  ]
})
export class AISearchModule { }
