import { Component, ElementRef, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { OneSignalService } from 'src/app/services/one-signal.service';
import { StorageService } from 'src/app/services/storage.service';
import { Modal } from 'bootstrap';
import { ModalService } from 'src/app/services/modal.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form = this.formBuilder.group({
    name: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required,Validators.minLength(6),Validators.maxLength(16)]),
    confirmPassword : new FormControl(null, [Validators.required]),
  },
  { validators: (group: AbstractControl)=> {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    if(pass === confirmPass) {
      return null;
    } else if(pass !== confirmPass && group.get('password').dirty && group.get('confirmPassword').dirty) {
      group.get('confirmPassword')?.setErrors({ notSame: true });
      return { notSame: true };
    } else {
      return null;
    }
  } });
  submitted = false;
  error: string;
  isProcessing = false;
  otp = "";
  @ViewChild('otpModal') otpModal!: ElementRef<HTMLDivElement>;
  otpModalInstance;
  isResendDisabled: boolean = true;
  resendTimer: number = 30; // Timer in seconds
  resendInterval!: any;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private storageService: StorageService,
    private oneSignalService: OneSignalService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    private modalService: ModalService,
    private router: Router) {
      const user = this.storageService.getCurrentUser();
      if(user) {
        this.authService.redirectToPage(false);
      }
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.form.valueChanges.subscribe(res=> {
      this.error = null;
    });
  }
  // Start the countdown timer
  startResendTimer() {
    this.isResendDisabled = true; // Disable the resend button
    this.resendTimer = 30; // Reset the timer to 30 seconds

    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer === 0) {
        clearInterval(this.resendInterval); // Stop the interval when the timer hits zero
        this.isResendDisabled = false; // Enable the resend button
      }
    }, 1000);
  }

  onOtpChange(otp) {
    this.otp = otp;
  }


  async onSubmit() {
    if (this.form.invalid) {
        return;
    }
    try{
      const params = this.form.value;
      this.loaderService.show();
      this.authService.registerCustomer(params)
        .subscribe(async res => {
          this.loaderService.hide();
          if (res.success) {
            this.otpModalInstance = new Modal(this.otpModal.nativeElement, {
              backdrop: 'static',
              keyboard: false  // Optional: Prevent closing with ESC key
            });
            this.otpModalInstance.show();
            this.startResendTimer(); // Start the timer when the modal is shown
          } else {
            if(res.message.toLowerCase().includes("already used")) {
              this.form.setErrors({
                notFound: true
              });
              this.form.controls.email.setErrors({
                alreadyUsed: true
              });
            }
            this.error = typeof res?.message !== "string" && Array.isArray(res.message) ? res.message[0] : res.message;
            this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
            this.loaderService.hide();
          }
        }, async (res) => {
          this.error = res.error.message;
          this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
          this.loaderService.hide();
        });
    } catch (e){
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
      this.loaderService.hide();
    }
  }

  async onReSubmitEmailVerification() {
    await this.onSubmit();
  }

  async onVerify() {
    this.error = null;
    try {
      if(this.otp && this.otp !=="") {
        this.isProcessing = true;
        this.loaderService.show();
        this.authService.registerVerify({
          otp: this.otp,
          email: this.form.value.email,
        }).subscribe(async res=> {
          this.loaderService.hide();
          this.isProcessing = false;
          this.otpModalInstance.hide();
          if(res.success && res.data) {
            this.storageService.saveCurrentUser(res.data);
            this.modalService.openResultModal({
              success: true,
              header: "Registration Successful!",
              description: `Thank you for registering with ${environment.appName}!. You can now browse our products and place your orders.`,
              confirm: ()=> {
                this.modalService.closeAll();
                window.location.href = "/login";
              }
            });
          } else {
            this.isProcessing = false;
            this.loaderService.hide();
            this.error = typeof res?.message !== "string" && Array.isArray(res.message) ? res.message[0] : res.message;
            this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
            this.loaderService.hide();
            this.modalService.openResultModal({
              success: false,
              header: "Error Verifying OTP!",
              description: this.error,
              confirm: ()=> {
                this.modalService.closeAll();
              }
            });
          }
        }, async (err)=> {
          this.isProcessing = false;
          this.loaderService.hide();
          this.error = Array.isArray(err.message) ? err.message[0] : err.message;
          this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
          this.loaderService.hide();
          this.modalService.openResultModal({
            success: false,
            header: "Error Verifying OTP!",
            description: this.error,
            confirm: ()=> {
              this.modalService.closeAll();
            }
          });
        }, async ()=> {
        });
      }
    } catch(ex) {
      this.isProcessing = false;
      this.loaderService.hide();
      this.error = Array.isArray(ex.message) ? ex.message[0] : ex.message;
      this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
      this.modalService.openResultModal({
        success: false,
        header: "Error Verifying OTP!",
        description: this.error,
        confirm: ()=> {
          this.modalService.closeAll();
        }
      });
    }
  }
}
