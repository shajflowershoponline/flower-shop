import { CustomerUser } from 'src/app/model/customer-user';
import { SystemConfigService } from './../../services/system-config.service';
import { Component } from '@angular/core';
import { OneSignalService } from 'src/app/services/one-signal.service';
import { StorageService } from 'src/app/services/storage.service';
import Swiper from 'swiper';
// Install modules
@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  currentUser: CustomerUser;
  intro11Slider: Swiper;
  testimonialCarousel: Swiper;
  slideConfig: {
    1: {
      title: string;
      description: string;
      image: string;
    },
    2: {
      title: string;
      description: string;
      image: string;
    }
  };
  constructor(
    private readonly systemConfigService: SystemConfigService,
    private readonly storageService: StorageService,
  ) {
    this.currentUser = this.storageService.getCurrentUser();
  }

  get isAuthenticated() {
    return this.currentUser && this.currentUser?.customerUserCode;
  }

  get slider1Styles() {
    return {
      'background-image': `url("${this.slideConfig?.[1]?.image && this.slideConfig?.[1]?.image !== '' ? this.slideConfig?.[1]?.image : '../../../assets/images/slider/1-1.jpg'}")`,
    };
  }
  get slider2Styles() {
    return {
      'background-image': `url("${this.slideConfig?.[2]?.image && this.slideConfig?.[2]?.image !== '' ? this.slideConfig?.[2]?.image : '../../../assets/images/slider/1-2.jpg'}")`,
    };
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    const jsonValue = this.systemConfigService.get("CLIENT_SITE_SLIDES_CONTENTS");
    const data = JSON.parse(jsonValue);
    if (data) {
      this.slideConfig = data;
    }
  }

  ngAfterViewInit(): void {
    // Home 01 Slider
    this.intro11Slider = new Swiper('.intro11-slider', {
      loop: true,
      speed: 400,
      slidesPerView: 1,
      spaceBetween: 10,
      effect: 'fade',
      navigation: {
        nextEl: '.intro11-next',
        prevEl: '.intro11-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
      },
      observer: true,
      observeParents: true,
    });

  }

  slideNext() {
    if (this.intro11Slider) {
      this.intro11Slider.slideNext();
    }
  }

  slidePrev() {
    if (this.intro11Slider) {
      this.intro11Slider.slidePrev();
    }
  }

}
