import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CustomerUser } from 'src/app/model/customer-user';
import { Order } from 'src/app/model/order.model';
import { LoaderService } from 'src/app/services/loader.service';
import { MODAL_TYPE, ModalService } from 'src/app/services/modal.service';
import { OrderService } from 'src/app/services/order.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent {
  orders: Order[] = [];
  searchCtrl = new FormControl();
  isLoading = false;
  pageIndex = 0;
  pageSize = 12;
  total = 0;
  totalPages = 0;
  pages: number[] = [];
  error;
  isProcessing = false;
  currentUser: CustomerUser;
  constructor(
    private readonly orderService: OrderService,
    private readonly modalService: ModalService,
    private readonly loaderService: LoaderService,
    private readonly snackBar: MatSnackBar,
    private storageService: StorageService,
    private router: Router) {
    this.currentUser = this.storageService.getCurrentUser();
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
      this.orderService.getAdvanceSearch({
        customerUserId: this.currentUser?.customerUserId,
        keywords: key,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      }).subscribe(async res => {
        this.isLoading = false;
        if (res.success) {
          this.orders = res.data.results;
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

  onCancelOrder(orderCode) {
    try {
      if (!this.isAuthenticated) {
        window.location.href = "login";
      }
      this.modalService.openPromptModal({
        header: "Confirm Cancellation!",
        description: `Are you sure you want to cancel this order? This action cannot be undone and the customer will be notified.`,
        confirmText: "Cancel Order",
        confirm: () => {
          this.isProcessing = true;
          this.loaderService.show();
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.orderService.updateStatus(orderCode, {
            status: "CANCELLED"
          }).subscribe(res => {
            this.isProcessing = false;
            this.loaderService.hide();
            if (res.success) {
              this.modalService.openResultModal({
                success: true,
                header: "Order Cancelled!",
                description: `The order has been successfully marked as Cancelled.`,
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                  this.getPaginated("");
                }
              });
            } else {
              this.error = typeof res?.message !== "string" && Array.isArray(res.message) ? res.message[0] : res.message;
              this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
              this.loaderService.hide();
              this.modalService.openResultModal({
                success: false,
                header: "Failed to Cancel order. Try Again!",
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
              header: "Failed to Cancel order. Try Again!",
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
        header: "Failed to Cancel order. Try Again!",
        description: this.error,
        confirm: () => {
          this.modalService.closeAll();
        }
      });
    }
  }
}
