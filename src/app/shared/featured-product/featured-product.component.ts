import { CommonModule } from '@angular/common';
import { Component, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerUser } from 'src/app/model/customer-user';
import { Product } from 'src/app/model/product';
import { ProductCollectionService } from 'src/app/services/product-collection.service';
import { ProductService } from 'src/app/services/product.service';
import { QuickProductViewModalComponent } from '../quick-product-view-modal/quick-product-view-modal.component';
import { StorageService } from 'src/app/services/storage.service';
import { Router, RouterModule } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { ModalService, MODAL_TYPE } from 'src/app/services/modal.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerUserWishlistService } from 'src/app/services/customer-user-wish-list.service';
import Swiper from 'swiper';

@Component({
  selector: 'app-featured-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuickProductViewModalComponent,
    RouterModule
  ],
  templateUrl: './featured-product.component.html',
  styleUrl: './featured-product.component.scss'
})
export class FeaturedProductComponent {
  currentUser: CustomerUser;
  productSlider: Swiper;
  products: Product[] = [];
  error: string;
  cartCount = 0;
  isLoading = false;
  @ViewChild('quickView') quickView!: QuickProductViewModalComponent;
  constructor(
    private readonly storageService: StorageService,
    private readonly productService: ProductService,
    private readonly modalService: ModalService,
    private readonly router: Router,
    private readonly cartService: CartService,
    private readonly snackBar: MatSnackBar,
    private readonly customerUserWishlistService: CustomerUserWishlistService,
  ) {
    this.currentUser = this.storageService.getCurrentUser();
  }

  get isAuthenticated() {
    return this.currentUser && this.currentUser?.customerUserCode;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

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
  }

  loadProducts() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.isLoading = true;
    try {
      this.productService.getAllFeaturedProducts(this.currentUser?.customerUserId??"0").subscribe(res => {
        this.products = res.data;
        this.isLoading = false;
      }, (res) => {
        this.isLoading = false;
      });
    } catch (ex) {
      this.isLoading = false;
    }
  }

  onOpenQuickView(product: Product) {
    this.quickView.showModal(product);
  }

  onAddToCart(product: Product) {
    try {
      this.modalService.openPromptModal({
        header: "Add to Cart",
        description: `Do you want to add "${product.name}" to your cart?`,
        confirmText: "Yes",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);

          this.cartService.create({
            productId: product?.productId,
            customerUserId: this.currentUser?.customerUserId,
            quantity: "1",
            price: product?.price,
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

  onAddToWishlist(product: Product) {
    if (product.iAmInterested) {
      this.modalService.openPromptModal({
        header: "Already added!",
        description: `Do you want to remove "${product.name}" to your wishlist?`,
        confirmText: "Yes, Remove it",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.customerUserWishlistService.delete(product.customerUserWishlist?.customerUserWishlistId).subscribe(res => {
            this.loadProducts();
            if (res.success) {
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
      return
    }
    try {
      this.modalService.openPromptModal({
        header: "Add to Wishlist?",
        description: `Do you want to add "${product.name}" to your wishlist?`,
        confirmText: "Yes",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);

          this.customerUserWishlistService.create({
            productId: product?.productId,
            customerUserId: this.currentUser?.customerUserId,
          }).subscribe(res => {
            if (res.success) {
              this.modalService.openResultModal({
                success: true,
                header: "Flower Added!",
                description: "Added to wishlist successfully!",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                  this.loadProducts();
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

  onModalActionChange(event) {
    this.loadProducts();
  }

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../assets/images/thumbnail-product.png';
  }
}
