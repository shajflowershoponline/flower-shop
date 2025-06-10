import { CartService } from 'src/app/services/cart.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CartItems } from 'src/app/model/cart.model';
import { CustomerUser } from 'src/app/model/customer-user';
import { StorageService } from 'src/app/services/storage.service';
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {
  currentUser: CustomerUser;
  cartItems: CartItems[] = [];
  checkoutModalRef: any;
  cartCount = 0;
  constructor(private readonly cartService: CartService,
    private storageService: StorageService,
    private router: Router) {
    this.currentUser = this.storageService.getCurrentUser();
  }

  get subTotal(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.total ?? 0), 0);
  }

  get total() {
    return this.subTotal;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.getItems();
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.getItems();
    });
  }

  getItems() {
    this.cartService.getItems(
      this.currentUser.customerUserId
    ).subscribe((res) => {
      const items = res.data.results.map(item => {
        item.quantity = Number(item.quantity ?? 0);
        item.total = Number(item.quantity ?? 0) * Number(item.product?.price ?? 0);
        return item;
      });
      this.cartItems = [];
      for (let item of items) {
        this.cartItems.push({
          ...item,
        });
      }

      if(this.cartItems.length !== this.cartCount) {
        this.cartService.setCartCount(this.cartItems.length);
      }
    });
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

    const checkoutModalElement = document.getElementById('headerCheckOutModal');
    if (checkoutModalElement) {
      this.checkoutModalRef = new bootstrap.Modal(checkoutModalElement);
    }
  }

  onCheckout() {
    this.checkoutModalRef.hide();
    this.router.navigate(["/checkout"], { replaceUrl: true });
  }

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../assets/images/default-product-image.png';
  }
}
