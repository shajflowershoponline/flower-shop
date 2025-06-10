import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from './change-password.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { MaterialModule } from 'src/app/shared/material/material.module';



@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    RouterModule.forChild([{
      path: '',
      component: ChangePasswordComponent,
    }])
  ]
})
export class ChangePasswordModule { }
