import { SystemConfigService } from './../../services/system-config.service';
import { Component } from '@angular/core';
import { OneSignalService } from 'src/app/services/one-signal.service';
import Swiper from 'swiper';
// Install modules
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  intro11Slider: Swiper;
  productSlider: Swiper;
  itemCarousel2: Swiper;
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
  constructor(private readonly systemConfigService: SystemConfigService) {

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
        nextEl: '.home1-slider-next',
        prevEl: '.home1-slider-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,  // Corrected to boolean
      },
      // autoplay: {},
    });

    // Product Carousel
    this.productSlider = new Swiper('.product-slider', {
      slidesPerView: 1,
      spaceBetween: 10,
      pagination: {
        el: ".swiper-pagination",
        type: 'bullets',
        clickable: true,
      },
      //autoplay: {},
      // Responsive breakpoints
      breakpoints: {
        // when window width is >= 320px
        320: {
          slidesPerView: 1,
          spaceBetween: 10
        },
        // when window width is >= 480px
        480: {
          slidesPerView: 2,
          spaceBetween: 10
        },
        // when window width is >= 767px
        768: {
          slidesPerView: 3,
          spaceBetween: 10
        },
        // when window width is >= 1200px
        1200: {
          slidesPerView: 4,
          spaceBetween: 10
        },
      }
    });

    // item Carousel 2
    this.itemCarousel2 = new Swiper('.item-carousel-2', {
      slidesPerView: 1,
      spaceBetween: 10,
      pagination: {
        el: ".swiper-pagination",
        type: 'bullets',
        clickable: true,
      },
      //autoplay: {},
      // Responsive breakpoints
      breakpoints: {
        // when window width is >= 480px
        480: {
          slidesPerView: 1,
        },
        // when window width is >= 575px
        575: {
          slidesPerView: 2,
        },
        // when window width is >= 767px
        767: {
          slidesPerView: 2,
        },
        // when window width is >= 991px
        991: {
          slidesPerView: 2,
        },
        // when window width is >= 1200px
        1200: {
          slidesPerView: 3,
        },
      }
    });

    // Testimonial Carousel
    this.testimonialCarousel = new Swiper('.testimonial-carousel', {
      loop: true,
      speed: 800,
      slidesPerView: 1,
      spaceBetween: 10,
      effect: 'slide',
      navigation: {
        nextEl: '.home1-slider-next',
        prevEl: '.home1-slider-prev',
      },
      //autoplay: {},

    });
  }
}
