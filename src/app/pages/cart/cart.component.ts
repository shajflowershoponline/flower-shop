import { Discounts } from './../../model/discounts';
import { Component } from '@angular/core';
import { CartItems } from 'src/app/model/cart.model';
import { CustomerUser } from 'src/app/model/customer-user';
import { CartService } from 'src/app/services/cart.service';
import { StorageService } from 'src/app/services/storage.service';
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';
import { SystemConfig } from 'src/app/model/system-config';
import { SystemConfigService } from 'src/app/services/system-config.service';
import { DeliveryService } from 'src/app/services/delivery.service';
import { MODAL_TYPE, ModalService } from 'src/app/services/modal.service';
import { LoaderService } from 'src/app/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  currentUser: CustomerUser;
  cartItems: CartItems[] = [];
  updatedCartItems: CartItems[] = [];
  currentCartItemSelected: CartItems | null = null;
  deliveryFee = 0;
  DELIVERY_RATE = 0;
  STORE_LOCATION_COORDINATES: {
    lat: number;
    lng: number;
  };
  promoCode = null;
  currentDiscount: Discounts;

  error: string;
  isProcessing = false;
  constructor(private readonly cartService: CartService,
    private storageService: StorageService,
    private systemConfigService: SystemConfigService,
    private deliveryService: DeliveryService,
    private loaderService: LoaderService,
    private modalService: ModalService,
    private snackBar: MatSnackBar,
    private router: Router,) {
    this.currentUser = this.storageService.getCurrentUser();
    this.DELIVERY_RATE = Number(this.systemConfigService.get("DELIVERY_RATE") ?? 0);

    const coordinates = this.systemConfigService.get("STORE_LOCATION_COORDINATES");
    this.STORE_LOCATION_COORDINATES = {
      lat: parseFloat(coordinates.split(",")[0] || "0"),
      lng: parseFloat(coordinates.split(",")[1] || "0"),
    };
  }

  get subTotal(): number {
    return this.updatedCartItems.reduce((acc, item) => acc + (item.total ?? 0), 0);
  }

  get subTotalDiscounted(): number {
    return this.updatedCartItems.reduce((acc, item) => acc + (Number(item.product?.discountPrice ?? 0) * Number(item?.quantity)), 0);
  }

  get discountAmount(): number {
    if (!this.currentDiscount) return 0;
    return this.subTotal - this.subTotalDiscounted;
  }

  get total(): number {
    return this.subTotal - this.discountAmount + this.deliveryFee;
  }

  get hasCartItemsChanges() {
    return JSON.stringify(this.cartItems) !== JSON.stringify(this.updatedCartItems);
  }

  get isAuthenticated() {
    return this.currentUser && this.currentUser?.customerUserCode;
  }

  get isDiscountAppliedToAll() {
    return this.updatedCartItems.every(x=>x.appliedDiscount);
  }

  ngOnInit(): void {
    // Initialization logic can go here
    this.getItems();
    this.calculateDeliveryFee();
  }

  getItems() {
    this.cartService.getItems(this.currentUser.customerUserId).subscribe((res) => {
      // handle next value here
      if (res && res.data) {
        console.log('Cart items:', res.data);
        const items = res.data.results.map(item => {
          item.quantity = Number(item.quantity ?? 0);
          item.product.price = Number(item.product?.price ?? 0);
          item.product.discountPrice = Number(item.product?.discountPrice ?? 0);
          item.total = Number(item.quantity ?? 0) * Number(item.product?.price ?? 0);
          return item;
        }
        );
        this.cartItems = [];
        this.updatedCartItems = [];
        for (let item of items) {
          this.cartItems.push({
            ...item,
          });
          this.updatedCartItems.push({
            ...item,
          });
        }
        this.cartService.setCartCount(this.updatedCartItems.length);
        this.currentDiscount = res.data?.activeCoupon?.discount;
        this.promoCode = this.currentDiscount.promoCode;
      } else {
        console.error('No cart items found');
      }
    },
      (error) => {
        // handle error here
        console.error('Error fetching cart items:', error);
      }
    );
  }

  calculateDeliveryFee() {

    if (this.currentUser?.addressCoordinates && this.currentUser?.addressCoordinates?.lat && this.currentUser?.addressCoordinates?.lng) {
      this.deliveryService.calculate({
        pickupCoords: this.STORE_LOCATION_COORDINATES,
        dropoffCoords: {
          lat: this.currentUser?.addressCoordinates ? Number(this.currentUser?.addressCoordinates?.lat ?? 0) : 0,
          lng: this.currentUser?.addressCoordinates ? Number(this.currentUser?.addressCoordinates?.lng ?? 0) : 0,
        }
      }).subscribe(res=> {
        if(res.success) {
          this.deliveryFee = res.data.deliveryFee;
        }
      })
    }
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

  }
  ngOnDestroy(): void {
  }

  onEditQuantity() {
    this.updatedCartItems = this.updatedCartItems.map(item => {
      item.quantity = item.quantity <= 0 ? 0 : item.quantity;
      item.total = Number(item.quantity ?? 0) * Number(item.product?.price ?? 0);
      return item;
    });
    console.log('Editing quantity for cart item:', this.updatedCartItems);
    console.log('Original cart items:', this.cartItems);
  }

  onDeleteCartitem(cartItem: CartItems) {
    this.currentCartItemSelected = cartItem;
    this.modalService.openPromptModal({
      header: "Are you sure you want to delete this item?",
      description: "This action cannot be undone. The item will be permanently removed from your account.",
      confirmText: "Delete",
      confirm: () => {
        this.modalService.close(MODAL_TYPE.PROMPT);
        this.onDelete();
      }
    });
  }

  onUpdateCart() {
    if (!this.isAuthenticated) {
      window.location.href = "login";
    }
    this.modalService.openPromptModal({
      header: "Update your cart?",
      description: "Your item quantities, selections, or options will be updated. This will refresh your total and applied discounts.",
      confirmText: "Update",
      confirm: () => {
        this.modalService.close(MODAL_TYPE.PROMPT);
        this.onUpdate();
      }
    });
  }

  onConfirmCoupon() {
    if (!this.isAuthenticated) {
      window.location.href = "login";
    }
    this.modalService.openPromptModal({
      header: !this.promoCode || this.promoCode === '' ? 'Remove Coupon?' : 'Apply Coupon?',
      description: !this.promoCode || this.promoCode === ''
        ? 'Are you sure you want to remove the currently applied coupon?'
        : 'Do you want to apply this coupon to your order?',
      confirmText: "Confirm",
      confirm: () => {
        this.modalService.close(MODAL_TYPE.PROMPT);
        this.onSaveCoupon();
      }
    });
  }

  onCheckout() {
    if (!this.isAuthenticated) {
      window.location.href = "login";
    }
    this.modalService.openPromptModal({
      header: "Proceed to Checkout?",
      description: "Review your cart and proceed to checkout securely.",
      confirmText: "Yes Proceed",
      confirm: () => {
        this.modalService.close(MODAL_TYPE.PROMPT);
        this.router.navigate(["/checkout"])
      }
    });
  }

  onUpdate() {
    this.isProcessing = true;
    this.loaderService.show();
    this.cartService.update({
      customerUserId: this.currentUser.customerUserId,
      items: this.updatedCartItems.map(item => ({
        cartItemId: item.cartItemId,
        quantity: item.quantity,
      })
      )
    }).subscribe(
      (res) => {
        this.isProcessing = false;
        this.loaderService.hide();
        if (res.success) {
          this.currentCartItemSelected = null;
          this.modalService.openResultModal({
            success: true,
            header: "Cart Updated!",
            description: "Your cart has been successfully updated.",
            confirm: () => {
              this.modalService.close(MODAL_TYPE.RESULT);
              this.getItems();
            }
          });
        } else {
          this.error = res.message;
          this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
          this.modalService.openResultModal({
            success: false,
            header: "Error Updating Cart!",
            description: this.error,
            confirm: () => {
              this.modalService.closeAll();
            }
          });
        }
      }
      , (error) => {
        this.isProcessing = false;
        this.loaderService.hide();
        this.error = error.error.message;
        this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
        this.modalService.openResultModal({
          success: false,
          header: "Error Updating Cart!",
          description: this.error,
          confirm: () => {
            this.modalService.closeAll();
          }
        });
      }
    );
  }

  onDelete() {
    this.isProcessing = true;
    this.loaderService.show();
    this.updatedCartItems = this.cartItems.filter(item => item.cartItemId !== this.currentCartItemSelected.cartItemId);
    this.cartService.update({
      customerUserId: this.currentUser.customerUserId,
      items: this.updatedCartItems.map(item => ({
        cartItemId: item.cartItemId,
        quantity: item.quantity,
      })
      )
    }).subscribe(
      (res) => {
        this.isProcessing = false;
        this.loaderService.hide();
        if (res.success) {
          this.currentCartItemSelected = null;
          this.modalService.openResultModal({
            success: true,
            header: "Cart Item Deleted!",
            description: 'The cart item has been successfully deleted.',
            confirm: () => {
              this.modalService.closeAll();
              this.getItems();
            }
          });
        } else {
          this.error = res.message;
          this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
          this.modalService.openResultModal({
            success: false,
            header: "Error Deleting Cart Item!",
            description: this.error,
            confirm: () => {
              this.modalService.closeAll();
            }
          });
        }
      }
      , (res) => {
        this.isProcessing = false;
        this.loaderService.hide();
        this.error = res.error.message;
        this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
        this.modalService.openResultModal({
          success: false,
          header: "Error Deleting Cart Item!",
          description: this.error,
          confirm: () => {
            this.modalService.closeAll();
          }
        });
      }
    );
  }

  onSaveCoupon() {
    this.isProcessing = true;
    this.loaderService.show();
    this.cartService.manageCoupon({
      customerUserId: this.currentUser.customerUserId,
      promoCode: this.promoCode
    }).subscribe(
      (res) => {
        this.isProcessing = false;
        this.loaderService.hide();
        if (res.success) {
          this.currentDiscount = res.data.discount;
          this.modalService.openResultModal({
            success: true,
            header: this.promoCode && this.promoCode !== '' ? 'Coupon Applied' : 'Coupon Removed',
            description: this.promoCode && this.promoCode !== '' ? 'Your discount has been successfully applied to your order' : 'The coupon has been removed from your order.',
            confirm: () => {
              this.modalService.closeAll();
              this.getItems();
            }
          });
        } else {
          this.promoCode = null;
          this.currentDiscount = null;
          this.getItems();
          this.error = res.message;
          this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
          this.modalService.openResultModal({
            success: false,
            header: "Invalid Coupon!",
            description: this.error,
            confirm: () => {
              this.modalService.closeAll();
            }
          });
        }
      }
      , (res) => {
        this.promoCode = null;
        this.currentDiscount = null;
        this.getItems();
        this.isProcessing = false;
        this.loaderService.hide();
        this.error = res.error.message;
        this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
        this.modalService.openResultModal({
          success: false,
          header: "Error: Applying Coupon!",
          description: this.error,
          confirm: () => {
            this.modalService.closeAll();
          }
        });
      }
    );
  }

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../assets/images/default-product-image.png';
  }
}
