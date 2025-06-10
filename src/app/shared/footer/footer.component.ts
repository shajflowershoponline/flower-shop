import { Component, Input } from '@angular/core';
import { CustomerUser } from 'src/app/model/customer-user';
import { StorageService } from 'src/app/services/storage.service';
import { SystemConfigService } from 'src/app/services/system-config.service';

@Component({
  selector: 'footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentUser: CustomerUser;
  facebookLink = "";
  location = "";
  locationCoordinates = "";
  mobilePhone = "";
  email = "";
  @Input() footerClass: string;
  constructor(
    private storageService: StorageService,
    private systemConfigService: SystemConfigService,
  ) {
    this.currentUser = this.storageService.getCurrentUser();
  }

  loadContent({ title, description,  }) {
    if (document.querySelector("#bannerTitle")) {
      document.querySelector("#bannerTitle").innerHTML = title;
    }
    if (document.querySelector("#bannerDesc")) {
      document.querySelector("#bannerDesc").innerHTML = description;
    }
  }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    //Called after ngOnInit when the component's or directive's content has been initialized.
    //Add 'implements AfterContentInit' to the class.

    const jsonValue = this.systemConfigService.get("CLIENT_SITE_FOOTER_BANNER_CONTENT");
    const data = JSON.parse(jsonValue);
    if (data) {
      this.loadContent(data);
    }

    this.facebookLink = this.systemConfigService.get("SOCIAL_FACEBOOK_LINK");
    this.location = this.systemConfigService.get("STORE_LOCATION_NAME");
    this.locationCoordinates = this.systemConfigService.get("STORE_LOCATION_COORDINATES");
    this.locationCoordinates = this.locationCoordinates.split(" ").join("");
    this.mobilePhone = this.systemConfigService.get("STORE_MOBILE_NUMBER");
    this.email = this.systemConfigService.get("STORE_SUPPORT_EMAIL");

  }
}
