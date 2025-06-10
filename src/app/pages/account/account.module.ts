import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account.component';
import { RouterModule } from '@angular/router';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { AuthGuard } from 'src/app/shared/guard/auth.guard';
import { NgOtpInputModule } from 'ng-otp-input';
import { AddressComponent } from './address/address.component';
import { LocationPickerComponent } from 'src/app/shared/location-picker/location-picker.component';
import { LocationMapViewerComponent } from 'src/app/shared/location-map-viewer/location-map-viewer.component';
import { MyWishListComponent } from './my-wish-list/my-wish-list.component';

@NgModule({
  declarations: [
    AccountComponent,AccountDetailsComponent,MyWishListComponent,MyOrdersComponent,ChangePasswordComponent,AddressComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    NgOtpInputModule,
    LocationMapViewerComponent,
    LocationPickerComponent,
    RouterModule.forChild([{
      path: '',
      component: AccountComponent,
      children: [
        { path: '', redirectTo: 'account-details', pathMatch: 'full' },
        {
          path: 'account-details',
          component: AccountDetailsComponent,
          canActivate: [AuthGuard],
          data: { title: 'Account Details', footerClass: 'mt-no-text' },
        },
        {
          path: 'address',
          component: AddressComponent,
          canActivate: [AuthGuard],
          data: { title: 'Address', footerClass: 'mt-no-text' },
        },
        { path: 'my-orders',
          component:
          MyOrdersComponent ,
          canActivate: [AuthGuard],
          data: { title: 'My Orders', footerClass: 'mt-no-text' },
        },
        { path: 'my-wish-list',
          component:
          MyWishListComponent ,
          canActivate: [AuthGuard],
          data: { title: 'My Wishlist', footerClass: 'mt-no-text' },
        },
        { path: 'change-password',
          component: ChangePasswordComponent ,
          canActivate: [AuthGuard],
          data: { title: 'Change Password', footerClass: 'mt-no-text' },
        }
      ]
    }
    ])
  ],
})
export class AccountModule { }
