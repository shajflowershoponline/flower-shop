import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { CustomerUser } from 'src/app/model/customer-user';
import { CustomerUserWishlist } from 'src/app/model/customer-user-wish-list.model';
import { Discounts } from 'src/app/model/discounts';
import { Product } from 'src/app/model/product';
import { CartService } from 'src/app/services/cart.service';
import { CustomerUserWishlistService } from 'src/app/services/customer-user-wish-list.service';
import { DiscountsService } from 'src/app/services/discounts.service';
import { ModalService, MODAL_TYPE } from 'src/app/services/modal.service';
import { ProductService } from 'src/app/services/product.service';
import { StorageService } from 'src/app/services/storage.service';
import Swiper from 'swiper';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class Productomponent {
  galleryThumbs: Swiper;
  singleProductImg: Swiper;
  productSlider: Swiper;
  itemCarousel2: Swiper;
  testimonialCarousel: Swiper;
  product: Product;
  customerUserWishlist: CustomerUserWishlist;
  sku;
  error: string;
  currentUser: CustomerUser;
  tabInfoSelected: "DESC" | "SHIPPING" = "DESC"
  cartCount = 0;
  addToCart = 1;
  isLoading = false;
  constructor(
    private readonly productService: ProductService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private readonly cartService: CartService,
    private snackBar: MatSnackBar,
    private modalService: ModalService,
    private readonly customerUserWishlistService: CustomerUserWishlistService
  ) {
    this.currentUser = this.storageService.getCurrentUser();
    this.sku = this.route.snapshot.paramMap.get('sku');
    this.cartService.cartCount$.subscribe(res => {
      this.cartCount = res;
    });
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.addToCart = 1;
    this.getProduct();
  }

  getProduct() {
    try {
      this.isLoading = true;

      combineLatest([
        this.productService.getByCode(this.sku),
        this.customerUserWishlistService.getBySKU(this.currentUser?.customerUserId, this.sku),
      ])
        .subscribe(([product, wishlist]) => {
          this.isLoading = false;
          if (product.success) {
            this.product = product.data;
          }
          if (wishlist.success && wishlist.data) {
            this.customerUserWishlist = wishlist.data;
            this.product.iAmInterested = this.customerUserWishlist?.product?.sku === this.product?.sku;
          }
        }, (res) => {
          this.isLoading = false;
          this.router.navigateByUrl("/search")
        });
    } catch (ex) {
      this.isLoading = false;
      this.error = ex.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
    }
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      const thumbsEl = document.querySelector('.gallery-thumbs') as HTMLElement;
      const mainEl = document.querySelector('.gallery-top') as HTMLElement;

      if (thumbsEl && mainEl) {
        this.galleryThumbs = new Swiper(thumbsEl, {
          spaceBetween: 10,
          slidesPerView: 4,
          watchSlidesProgress: true,
        });

        this.singleProductImg = new Swiper(mainEl, {
          spaceBetween: 10,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          thumbs: {
            swiper: this.galleryThumbs,
          },
        });

        console.log('Swiper initialized');
      } else {
        console.warn('Swiper DOM elements not found');
      }
    }, 0);
  }

  ngAfterViewChecked(): void {
    if (this.product?.productImages.length && !this.singleProductImg) {
      setTimeout(() => {
        const thumbsEl = document.querySelector('.gallery-thumbs') as HTMLElement;
        const mainEl = document.querySelector('.gallery-top') as HTMLElement;

        if (thumbsEl && mainEl) {
          this.galleryThumbs = new Swiper(thumbsEl, {
            spaceBetween: 10,
            slidesPerView: 4,
            watchSlidesProgress: true,
          });

          this.singleProductImg = new Swiper(mainEl, {
            spaceBetween: 10,
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            thumbs: {
              swiper: this.galleryThumbs,
            },
          });
        }
      }, 100); // small delay to ensure DOM is stable
    }
  }


  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../assets/images/thumbnail-product.png';
  }

  onSearch(searchKey) {
    window.location.href = "/search?q=" + searchKey
  }

  onAddToCart() {
    try {
      this.modalService.openPromptModal({
        header: "Add to Cart",
        description: `Do you want to add "${this.product.name}" to your cart?`,
        confirmText: "Yes",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);

          this.cartService.create({
            productId: this.product?.productId,
            customerUserId: this.currentUser?.customerUserId,
            quantity: this.addToCart.toString(),
            price: this.product?.price,
          }).subscribe(res => {
            if (res.success) {
              this.modalService.openResultModal({
                success: true,
                header: "Flower Added!",
                description: "Added to cart successfully!",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                  this.cartService.setCartCount(this.cartCount + 1);
                }
              });
            } else {
              this.error = res.message;
              this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
              this.modalService.openResultModal({
                success: false,
                header: "Error Adding to Cart!",
                description: this.error,
                confirm: () => {
                  this.modalService.closeAll();
                }
              });
            }
          }, (res) => {
            this.error = res.error.message;
            this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
            this.modalService.openResultModal({
              success: false,
              header: "Error Adding to Cart!",
              description: this.error,
              confirm: () => {
                this.modalService.closeAll();
              }
            });
          });
        }
      });
    } catch (ex) {
      this.error = ex.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.modalService.openResultModal({
        success: false,
        header: "Error Adding to Cart!",
        description: this.error,
        confirm: () => {
          this.modalService.closeAll();
        }
      });
    }
  }

  onAddToWishlist() {
    if (this.product.iAmInterested) {
      this.modalService.openPromptModal({
        header: "Already added!",
        description: `Do you want to remove "${this.product.name}" to your wishlist?`,
        confirmText: "Yes, Remove it",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.customerUserWishlistService.delete(this.product.customerUserWishlist?.customerUserWishlistId).subscribe(res => {
            if (res.success) {
              this.getProduct();
              this.modalService.openResultModal({
                success: true,
                header: "Flower removed!",
                description: "Flower removed from wishlist successfully!",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                }
              });
            } else {
              this.error = res.message;
              this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
              this.modalService.openResultModal({
                success: false,
                header: "Error removing from wishlist!",
                description: this.error,
                confirm: () => {
                  this.modalService.closeAll();
                }
              });
            }
          });
        }
      });
      return;
    }
    try {
      this.modalService.openPromptModal({
        header: "Add to Wishlist?",
        description: `Do you want to add "${this.product.name}" to your wishlist?`,
        confirmText: "Yes",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);

          this.customerUserWishlistService.create({
            productId: this.product?.productId,
            customerUserId: this.currentUser?.customerUserId,
          }).subscribe(res => {
            if (res.success) {
              this.getProduct();
              this.modalService.openResultModal({
                success: true,
                header: "Flower Added!",
                description: "Added to wishlist successfully!",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                }
              });
            } else {
              this.error = res.message;
              this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
              this.modalService.openResultModal({
                success: false,
                header: "Error Adding to wishlist!",
                description: this.error,
                confirm: () => {
                  this.modalService.closeAll();
                }
              });
            }
          }, (res) => {
            this.error = res.error.message;
            this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
            this.modalService.openResultModal({
              success: false,
              header: "Error Adding to wishlist!",
              description: this.error,
              confirm: () => {
                this.modalService.closeAll();
              }
            });
          });
        }
      });
    } catch (ex) {
      this.error = ex.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.modalService.openResultModal({
        success: false,
        header: "Error Adding to wishlist!",
        description: this.error,
        confirm: () => {
          this.modalService.closeAll();
        }
      });
    }
  }
}
