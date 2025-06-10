import { ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {
  tab: "Account" | "My Orders" | "Change Password" = "Account";
  constructor(
    private cdr: ChangeDetectorRef,
    private titleService:Title, 
    private storageService:StorageService, 
    private authService:AuthService) {

  }

  async logOut() {
    this.storageService.saveCurrentUser(null)
    window.location.href = "login?ref=" + window.location.href;
  }

  changeTab(value: "Account" | "My Orders" | "Change Password") {
    this.tab = value;
    this.titleService.setTitle(`${value} | ${environment.appName}`);
    this.cdr.detectChanges();
  }
}
