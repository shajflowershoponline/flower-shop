import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes }   from '@angular/router';

import { AppComponent } from './app.component'
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CustomHttpInterceptor } from './interceptors/custom-http.interceptors';
import { Observable, interval } from 'rxjs';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './shared/material/material.module';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { AppDateAdapter } from './shared/utility/app-date-adapter';
import { DateAdapter } from '@angular/material/core';
import { CartItemComponent } from './shared/cart-item/cart-item.component';
import { LocationPickerComponent } from './shared/location-picker/location-picker.component';
import { SystemConfigService } from './services/system-config.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { GoogleMapsModule } from '@angular/google-maps';

export function initConfig(systemConfigService: SystemConfigService) {
  return () => systemConfigService.init();
}
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    CartItemComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    GoogleMapsModule
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500} },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [SystemConfigService],
      multi: true
    },
    {provide: DateAdapter, useClass: AppDateAdapter},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
