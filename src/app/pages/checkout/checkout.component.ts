import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CartItems } from 'src/app/model/cart.model';
import { CustomerUser } from 'src/app/model/customer-user';
import { Discounts } from 'src/app/model/discounts';
import { CartService } from 'src/app/services/cart.service';
import { CustomerUserService } from 'src/app/services/customer-user.service';
import { DeliveryService } from 'src/app/services/delivery.service';
import { GeoLocationService } from 'src/app/services/geo-location.service';
import { LoaderService } from 'src/app/services/loader.service';
import { MODAL_TYPE, ModalService } from 'src/app/services/modal.service';
import { OrderService } from 'src/app/services/order.service';
import { StorageService } from 'src/app/services/storage.service';
import { SystemConfigService } from 'src/app/services/system-config.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  showCoupon = false;
  currentUser: CustomerUser;
  form = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required]),
    mobileNumber: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^\+63 9\d{2} \d{4} \d{3}$/),
    ]),
    deliveryAddress: new FormControl(null, [Validators.required]),
    deliveryAddressLandmark: new FormControl(null, [Validators.required]),
    deliveryAddressCoordinates: new FormControl(null),
    specialInstructions: new FormControl(null),
    notesToRider: new FormControl(null),
  });

  deliveryFee = 0;
  DELIVERY_RATE = 0;
  STORE_LOCATION_COORDINATES: {
    lat: number;
    lng: number;
  };
  promoCode = null;
  currentDiscount: Discounts;
  paymentMethod = "COD";

  cartItems: CartItems[] = [];
  error;
  isProcessing = false;
  constructor(
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    private readonly storageService: StorageService,
    private readonly customerUserService: CustomerUserService,
    private readonly loaderService: LoaderService,
    private readonly modalService: ModalService,
    private readonly snackBar: MatSnackBar,
    private deliveryService: DeliveryService,
    private systemConfigService: SystemConfigService,
    private geoLocationService: GeoLocationService,
    private router: Router,) {
    this.currentUser = this.storageService.getCurrentUser();
    this.form.patchValue({
      name: this.currentUser.name,
      email: this.currentUser.email,
      mobileNumber: this.currentUser.mobileNumber,
      deliveryAddress: this.currentUser.address,
      deliveryAddressLandmark: this.currentUser.addressLandmark,
      deliveryAddressCoordinates: this.currentUser.addressCoordinates,
    });
    this.form.markAsDirty();
    this.form.markAsTouched();


    this.currentUser = this.storageService.getCurrentUser();
    this.DELIVERY_RATE = Number(this.systemConfigService.get("DELIVERY_RATE") ?? 0);

    const coordinates = this.systemConfigService.get("STORE_LOCATION_COORDINATES");
    this.STORE_LOCATION_COORDINATES = {
      lat: parseFloat(coordinates.split(",")[0] || "0"),
      lng: parseFloat(coordinates.split(",")[1] || "0"),
    };
    this.geoLocationService.data$.subscribe((pos: GeolocationPosition) => {
      if (pos?.coords && (!this.currentUser?.addressCoordinates || !this.currentUser?.addressCoordinates?.lat || !this.currentUser?.addressCoordinates?.lng)) {
        this.currentUser.addressCoordinates = {
          lat: pos.coords?.latitude,
          lng: pos.coords?.longitude,
        };
        if (!this.form.value?.deliveryAddressCoordinates?.lat || this.form.value?.deliveryAddressCoordinates?.lng) {
          this.form.get("deliveryAddressCoordinates").setValue(this.currentUser.addressCoordinates);
        }
      }
    });
  }

  get subTotal(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.total ?? 0), 0);
  }

  get subTotalDiscounted(): number {
    return this.cartItems.reduce((acc, item) => acc + (Number(item.product?.discountPrice ?? 0) * Number(item?.quantity)), 0);
  }

  get discountAmount(): number {
    if (!this.currentDiscount) return 0;
    return this.subTotal - this.subTotalDiscounted;
  }

  get total(): number {
    return this.subTotal - this.discountAmount + this.deliveryFee;
  }

  get isAuthenticated() {
    return this.currentUser && this.currentUser?.customerUserCode;
  }

  get isDiscountAppliedToAll() {
    return this.cartItems.every(x => x.appliedDiscount);
  }

  ngOnInit(): void {
    // Initialization logic can go here
    this.getItems();
    this.calculateDeliveryFee();
  }

  getItems() {
    this.loaderService.show();
    this.form.disable();
    try {
      this.cartService.getItems(this.currentUser.customerUserId).subscribe((res) => {
        // handle next value here
        this.loaderService.hide();
        this.form.enable();
        if (res.success) {
          console.log('Cart items:', res.data);
          this.cartItems = res.data.results.map(item => {
            item.quantity = Number(item.quantity ?? 0);
            item.product.price = Number(item.product?.price ?? 0);
            item.product.discountPrice = Number(item.product?.discountPrice ?? 0);
            item.total = Number(item.quantity ?? 0) * Number(item.product?.price ?? 0);
            return item;
          }
          );
          this.cartService.setCartCount(this.cartItems.length);
          this.currentDiscount = res.data?.activeCoupon?.discount;
          this.promoCode = this.currentDiscount.promoCode;
        } else {
          console.error('No cart items found');
        }
      },
        (error) => {
          this.form.enable();
          // handle error here
          console.error('Error fetching cart items:', error);
        }
      );
    } catch (ex) {
      this.form.enable();
    }
  }

  calculateDeliveryFee() {
    if (this.form?.value?.deliveryAddressCoordinates && this.form?.value?.deliveryAddressCoordinates?.lat && this.form?.value?.deliveryAddressCoordinates?.lng) {
      this.loaderService.show();
      this.form.disable();
      try {
        this.deliveryService.calculate({
          pickupCoords: this.STORE_LOCATION_COORDINATES,
          dropoffCoords: {
            lat: this.form?.value?.deliveryAddressCoordinates ? Number(this.form?.value?.deliveryAddressCoordinates?.lat ?? 0) : 0,
            lng: this.form?.value?.deliveryAddressCoordinates ? Number(this.form?.value?.deliveryAddressCoordinates?.lng ?? 0) : 0,
          }
        }).subscribe(res => {
          this.loaderService.hide();
          this.form.enable();
          if (res.success) {
            this.deliveryFee = res.data.deliveryFee;
          }
        }, () => {
      this.form.enable();
          this.loaderService.hide();
        })
      } catch (ex) {
      this.form.enable();
        this.loaderService.hide();
      }
    } else {
      this.form.enable();
      this.loaderService.hide();
    }
  }

  onApplyCoupon() {
    this.modalService.openPromptModal({
      header: !this.promoCode || this.promoCode === '' ? 'Remove Coupon?' : 'Apply Coupon?',
      description: !this.promoCode || this.promoCode === ''
        ? 'Are you sure you want to remove the currently applied coupon?'
        : 'Do you want to apply this coupon to your order?',
      confirmText: "Save Changes",
      confirm: () => {
        this.modalService.close(MODAL_TYPE.PROMPT);
        this.loaderService.show();
        this.cartService.manageCoupon({
          customerUserId: this.currentUser.customerUserId,
          promoCode: this.promoCode
        }).subscribe(
          (res) => {
            this.loaderService.hide();
            if (res.success) {
              this.modalService.openResultModal({
                success: true,
                header: "Changes Saved Successfully!",
                description: "Your account details have been updated.",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                }
              });
              this.currentDiscount = res.data.discount;
            } else {
              this.promoCode = null;
              this.currentDiscount = null;
              this.error = typeof res?.message !== "string" && Array.isArray(res.message) ? res.message[0] : res.message;
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
          , (error) => {
            this.loaderService.hide();
            this.promoCode = null;
            this.currentDiscount = null;
            this.getItems();
            this.error = typeof error?.message !== "string" && Array.isArray(error.message) ? error.message[0] : error.message;
            this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
            this.modalService.openResultModal({
              success: false,
              header: "Error Saving Changes!",
              description: this.error,
              confirm: () => {
                this.modalService.closeAll();
              }
            });
          }
        );
      }
    });
  }

  formatMobileNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    const original = this.form.get('mobileNumber')?.value || '';
    let digits = input.value.replace(/\D/g, ''); // remove all non-digits

    // Remove duplicate "63" if user types it
    if (digits.startsWith('63')) {
      digits = digits.slice(2);
    }

    // Ensure it starts with 9
    if (!digits.startsWith('9')) {
      digits = '9' + digits;
    }

    digits = digits.slice(0, 10); // Keep only 10 digits

    // Format to: +63 9XX XXXX XXX (3-4-3)
    let formatted = '+63';
    if (digits.length > 0) {
      formatted += ` ${digits.slice(0, 3)}`;
    }
    if (digits.length > 3) {
      formatted += ` ${digits.slice(3, 7)}`;
    }
    if (digits.length > 7) {
      formatted += ` ${digits.slice(7, 10)}`;
    }

    // Only update form if the formatted value is different
    input.value = formatted;
    if (formatted !== original.trim()) {
      this.form.get('mobileNumber')?.setValue(formatted, { emitEvent: false });
    }
  }


  async onSubmit() {
    try {
      if (!this.isAuthenticated) {
        window.location.href = "login";
      }
      this.modalService.openPromptModal({
        header: "Confirm Your Order!",
        description: `Are you sure you want to place this order? Please review your items and shipping details before proceeding. You won’t be able to make changes once the order is placed.`,
        confirmText: "Place Order",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.onPlaceOrder();
        }
      });
    } catch (ex) {
      this.modalService.closeAll();
    }
  }

  async onPlaceOrder() {
    try {
      const formValue = {
        ...this.form.value,
        paymentMethod: this.paymentMethod,
        customerUserId: this.currentUser?.customerUserId,
        cartItemIds: this.cartItems.map(x => x.cartItemId)
      };
      this.isProcessing = true;
      this.loaderService.show();
      this.orderService.create(formValue)
        .subscribe(async res => {
          this.isProcessing = false;
          this.loaderService.hide();
          this.error = null;
          if (res.success) {
            this.modalService.openResultModal({
              success: true,
              header: "Order Placed Successfully!",
              description: `Thank you for your purchase! Your order has been placed and is now being processed. You will receive an update once it ships.`,
              confirm: () => {
                this.modalService.close(MODAL_TYPE.RESULT);
                this.router.navigate(["/account/my-orders"], { replaceUrl: true });
              }
            });
            this.storageService.saveCurrentUser(this.currentUser);
            this.form.markAsPristine();
            this.form.markAsUntouched();
          } else {
            this.isProcessing = false;
            this.loaderService.hide();
            this.error = typeof res?.message !== "string" && Array.isArray(res.message) ? res.message[0] : res.message;
            this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
            this.loaderService.hide();
            this.modalService.openResultModal({
              success: false,
              header: "Failed to Confirm your order. Try Again!",
              description: this.error,
              confirm: () => {
                this.modalService.closeAll();
              }
            });
          }
        }, async (res) => {
          this.error = null;
          this.isProcessing = false;
          this.loaderService.hide();
          this.error = res.error.message;
          this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
          this.loaderService.hide();
          this.modalService.openResultModal({
            success: false,
            header: "Failed to Confirm your order. Try Again!",
            description: this.error,
            confirm: () => {
              this.modalService.closeAll();
            }
          });
        });
    } catch (e) {
      this.error = null;
      this.isProcessing = false;
      this.loaderService.hide();
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.loaderService.hide();
      this.modalService.openResultModal({
        success: false,
        header: "Failed to Confirm your order. Try Again!",
        description: this.error,
        confirm: () => {
          this.modalService.closeAll();
        }
      });
    }
  }

  onLocationSelected(event: { selectedCoords: { lat: number, lng: number }; address: string; }) {
    console.log(event);
    if (event) {
      this.form.patchValue({
        deliveryAddress: event.address,
        deliveryAddressCoordinates: event.selectedCoords,
      });

      this.form.markAsDirty();
      this.form.markAllAsTouched();
      this.calculateDeliveryFee();
    }
  }
}
