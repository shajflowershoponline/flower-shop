import { Component, ElementRef, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerUser } from 'src/app/model/customer-user';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerUserService } from 'src/app/services/customer-user.service';
import { LoaderService } from 'src/app/services/loader.service';
import { OneSignalService } from 'src/app/services/one-signal.service';
import { StorageService } from 'src/app/services/storage.service';
import { Modal } from 'bootstrap';
import { MODAL_TYPE, ModalService } from 'src/app/services/modal.service';


@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent {
  form = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    mobileNumber: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^\+63 9\d{2} \d{4} \d{3}$/),
    ]),
  });

  submitted = false;
  error: string;
  isProcessing = false;
  currentUser: CustomerUser;
  constructor(
    private route: ActivatedRoute,
    private customerUserService: CustomerUserService,
    private authService: AuthService,
    private storageService: StorageService,
    private oneSignalService: OneSignalService,
    private loaderService: LoaderService,
    private modalService: ModalService,
    private snackBar: MatSnackBar,
    private router: Router) {
    this.currentUser = this.storageService.getCurrentUser();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this.currentUser && this.currentUser?.customerUserCode && this.currentUser?.customerUserCode !== '') {
      this.form.setValue({
        name: this.currentUser?.name,
        email: this.currentUser?.email,
        mobileNumber: this.currentUser?.mobileNumber,
      })
    }
    this.form.valueChanges.subscribe(res => {
      this.error = null;
    });
  }

  get isAuthenticated() {
    return this.currentUser && this.currentUser?.customerUserCode;
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
      if (this.form.invalid) {
        return;
      }
      this.modalService.openPromptModal({
        header: "Are you sure you want to save changes?",
        description: "You are about to save changes to your account details. Do you want to proceed?",
        confirmText: "Save Changes",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.onSaveChanges();
        }
      });
    } catch (ex) {
      this.modalService.closeAll();
    }
  }

  async onSaveChanges() {
    try {
      this.isProcessing = true;
      this.loaderService.show();
      this.customerUserService.updateProfile(this.currentUser?.customerUserCode, {
        ...this.currentUser,
        name: this.form.value.name,
        email: this.form.value.email,
        mobileNumber: this.form.value.mobileNumber,
      })
        .subscribe(async res => {
          this.isProcessing = false;
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
            this.currentUser = res.data;
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
              header: "Error Saving Changes!",
              description: this.error,
              confirm: () => {
                this.modalService.closeAll();
              }
            });
          }
        }, async (res) => {
          this.isProcessing = false;
          this.loaderService.hide();
          this.error = res.error.message;
          this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
          this.modalService.openResultModal({
            success: false,
            header: "Error Saving Changes!",
            description: this.error,
            confirm: () => {
              this.modalService.closeAll();
            }
          });
        });
    } catch (e) {
      this.isProcessing = false;
      this.loaderService.hide();
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.loaderService.hide();
      this.modalService.openResultModal({
        success: false,
        header: "Error Saving Changes!",
        description: this.error,
        confirm: () => {
          this.modalService.closeAll();
        }
      });
    }
  }
}
