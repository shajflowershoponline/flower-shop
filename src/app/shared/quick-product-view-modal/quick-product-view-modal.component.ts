import { CartService } from './../../services/cart.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';
import { Modal } from 'bootstrap';
import { Product } from 'src/app/model/product';
import { ModalService, MODAL_TYPE } from 'src/app/services/modal.service';
import { StorageService } from 'src/app/services/storage.service';
import { CustomerUser } from 'src/app/model/customer-user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerUserWishlistService } from 'src/app/services/customer-user-wish-list.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-quick-product-view-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './quick-product-view-modal.component.html',
  styleUrl: './quick-product-view-modal.component.scss',
})
export class QuickProductViewModalComponent {
  currentUser: CustomerUser;
  @ViewChild('modalRef', { static: true }) modalRef!: ElementRef;
  @Output() onModalActionChange = new EventEmitter<Product>();
  product: Product;
  private modalInstance!: Modal;

  search: string;
  error: string;
  cartCount = 0;
  addToCart = 1;
  constructor(
    private storageService: StorageService,
    private productService: ProductService,
    private readonly cartService: CartService,
    private readonly customerUserWishlistService: CustomerUserWishlistService,
    private snackBar: MatSnackBar,
    private modalService: ModalService,) {

    this.currentUser = this.storageService.getCurrentUser();
    this.cartService.cartCount$.subscribe(res => {
      this.cartCount = res;
    });
    this.productService.search$.subscribe(res => {
      this.search = res;
    });
  }

  get productImage() {
    if(this.product?.productImages?.[0]) {
      return this.product?.productImages?.[0].file?.url;
    } else {
      return this.getDeafaultPicture();
    }
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  ngAfterViewInit(): void {
    this.modalInstance = new Modal(this.modalRef.nativeElement);
  }

  public showModal(product: Product): void {
    this.addToCart = 1;
    this.product = product;
    console.log(this.product);
    this.modalInstance.show();
  }

  public hideModal(): void {
    this.modalInstance.hide();
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
            quantity: this.addToCart.toString(),
            price: product?.price,
          }).subscribe(res => {
            if (res.success) {
              this.onModalActionChange.emit(this.product);
              this.hideModal();
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
            this.hideModal();
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
      this.hideModal();
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
            this.hideModal();
            if (res.success) {
              this.onModalActionChange.emit(this.product);
              this.modalService.openResultModal({
                success: true,
                header: "Flower removed!",
                description: "Flower removed from wishlist successfully!",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                  this.productService.setSearch(this.search);
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
            this.hideModal();
            if (res.success) {
              this.onModalActionChange.emit(this.product);
              this.modalService.openResultModal({
                success: true,
                header: "Flower Added!",
                description: "Added to wishlist successfully!",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                  this.productService.setSearch(this.search);
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
            this.hideModal();
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
      this.hideModal();
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

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../assets/images/thumbnail-product.png';
  }
}
