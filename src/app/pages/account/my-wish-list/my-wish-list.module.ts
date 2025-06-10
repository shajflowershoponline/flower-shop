import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';=
import { RouterModule } from '@angular/router';
import { MyWishListComponent } from './my-wish-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{
      path: '',
      component: MyWishListComponent,
    }])
  ]
})
export class MyWishListModule { }
