import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AISearchComponent } from './ai-search.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuickProductViewModalComponent } from 'src/app/shared/quick-product-view-modal/quick-product-view-modal.component';


@NgModule({
  declarations: [
    AISearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuickProductViewModalComponent,
    RouterModule.forChild([
      { path: '', component: AISearchComponent }
    ])
  ]
})
export class AISearchModule { }
