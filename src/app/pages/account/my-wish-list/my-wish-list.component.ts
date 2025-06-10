import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CustomerUser } from 'src/app/model/customer-user';
import { CustomerUserWishlist } from 'src/app/model/customer-user-wish-list.model';
import { Order } from 'src/app/model/order.model';
import { Product } from 'src/app/model/product';
import { CartService } from 'src/app/services/cart.service';
import { CustomerUserWishlistService } from 'src/app/services/customer-user-wish-list.service';
import { CustomerUserService } from 'src/app/services/customer-user.service';
import { LoaderService } from 'src/app/services/loader.service';
import { MODAL_TYPE, ModalService } from 'src/app/services/modal.service';
import { OrderService } from 'src/app/services/order.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-my-wish-list',
  templateUrl: './my-wish-list.component.html',
  styleUrls: ['./my-wish-list.component.scss']
})
export class MyWishListComponent {
  customerUserWishlists: CustomerUserWishlist[] = [];
  searchCtrl = new FormControl();
  isLoading = false;
  pageIndex = 0;
  pageSize = 12;
  total = 0;
  totalPages = 0;
  pages: number[] = [];
  error;
  cartCount = 0;
  isProcessing = false;
  currentUser: CustomerUser;
  constructor(
    private readonly customerUserWishlistService: CustomerUserWishlistService,
    private readonly cartService: CartService,
    private readonly modalService: ModalService,
    private readonly loaderService: LoaderService,
    private readonly snackBar: MatSnackBar,
    private storageService: StorageService,
    private router: Router) {
    this.currentUser = this.storageService.getCurrentUser();
    this.cartService.cartCount$.subscribe(res => {
      this.cartCount = res;
    });
  }


  get startItem() {
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  get endItem() {
    const end = this.pageIndex * this.pageSize;
    return end > this.total ? this.total : end;
  }

  get isAuthenticated() {
    return this.currentUser && this.currentUser?.customerUserCode;
  }

  ngOnInit(): void {
    this.getPaginated();
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(2000), // Wait 500ms after the last keystroke
        distinctUntilChanged() // Only emit when the value actually changes
      )
      .subscribe(key => {
        this.getPaginated(key)
        // Perform API call or filter logic here
      });

  }

  getPaginated(key = "") {
    try {
      this.isLoading = true;
      this.customerUserWishlistService.getAdvanceSearch({
        customerUserId: this.currentUser?.customerUserId,
        keywords: key,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      }).subscribe(async res => {
        this.isLoading = false;
        if (res.success) {
          this.customerUserWishlists = res.data.results;
          this.total = res.data.total;
          this.totalPages = Math.ceil(this.total / this.pageSize);
          this.pages = this.generatePageArray();
        } else {
          this.error = typeof res?.message !== 'string' && Array.isArray(res.message) ? res.message[0] : res.message;
        }
      }, async (err) => {
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
      });
    } catch (e) {
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
    }
  }

  goToPage(index: number) {
    if (index < 0 || index >= this.totalPages) return;
    this.pageIndex = index;
    this.getPaginated(); // server-side call
  }

  generatePageArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, this.pageIndex - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage >= this.totalPages) {
      endPage = this.totalPages - 1;
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  onAddToCart(product: Product) {
    try {
      this.modalService.openPromptModal({
        header: "Add to Cart",
        description: `Do you want to add "${product.name}" to your cart?`,
        confirmText: "Yes",
        confirm: () => {
          this.isProcessing = true;
          this.loaderService.show();
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.cartService.create({
            productId: product?.productId,
            customerUserId: this.currentUser?.customerUserId,
            quantity: "1",
            price: product?.price,
          }).subscribe(res => {
            this.isProcessing = false;
            this.loaderService.hide();
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
          this.isProcessing = false;
          this.loaderService.hide();
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
      this.isProcessing = false;
      this.loaderService.hide();
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

  onDelete(customerUserWishlist: CustomerUserWishlist) {
    try {
      if (!this.isAuthenticated) {
        window.location.href = "login";
      }
      this.modalService.openPromptModal({
        header: "Remove item!",
        description: `Do you want to remove "${customerUserWishlist?.product?.name}" to your wishlist?`,
        confirmText: "Yes remove",
        confirm: () => {
          this.isProcessing = true;
          this.loaderService.show();
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.customerUserWishlistService.delete(customerUserWishlist?.customerUserWishlistId).subscribe(res => {
            this.isProcessing = false;
            this.loaderService.hide();
            if (res.success) {
              this.modalService.openResultModal({
                success: true,
                header: "Flower removed!",
                description: "Flower removed from wishlist successfully!",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                  this.getPaginated();
                }
              });
            } else {
              this.error = typeof res?.message !== "string" && Array.isArray(res.message) ? res.message[0] : res.message;
              this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
              this.loaderService.hide();
              this.modalService.openResultModal({
                success: false,
                header: "Error removing from wishlist. Try Again!",
                description: this.error,
                confirm: () => {
                  this.modalService.closeAll();
                }
              });
            }
          }, (res) => {
            this.error = null;
            this.isProcessing = false;
            this.loaderService.hide();
            this.error = res.error.message;
            this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
            this.loaderService.hide();
            this.modalService.openResultModal({
              success: false,
              header: "Error removing from wishlist. Try Again!",
              description: this.error,
              confirm: () => {
                this.modalService.closeAll();
              }
            });
          })
        }
      });
    } catch (ex) {
      this.error = null;
      this.isProcessing = false;
      this.loaderService.hide();
      this.error = ex.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.loaderService.hide();
      this.modalService.openResultModal({
        success: false,
        header: "Error removing from wishlist. Try Again!",
        description: this.error,
        confirm: () => {
          this.modalService.closeAll();
        }
      });
    }
  }
}
