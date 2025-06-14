import { Component, ElementRef, ViewChild } from '@angular/core';
import { Validators, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { OneSignalService } from 'src/app/services/one-signal.service';
import { StorageService } from 'src/app/services/storage.service';
import { Modal } from 'bootstrap';
import { MODAL_TYPE, ModalService } from 'src/app/services/modal.service';
import { environment } from 'src/environments/environment.prod';
import { NgOtpInputComponent } from 'ng-otp-input';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  submitForm = this.formBuilder.group({
    email: new FormControl(null, [Validators.required])
  });
  resetForm = this.formBuilder.group({
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
  mode: 'SUBMIT' | 'RESET' = 'SUBMIT';
  @ViewChild('otpModal') otpModal!: ElementRef<HTMLDivElement>;
  @ViewChild('otpControl') otpControl!: ElementRef<NgOtpInputComponent>;
  otpModalInstance;
  isResendDisabled: boolean = true;
  resendTimer: number = 30; // Timer in seconds
  resendInterval!: any;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private modalService: ModalService,
    private storageService: StorageService,
    private oneSignalService: OneSignalService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    private router: Router) {
      const user = this.storageService.getCurrentUser();
      if(user) {
        this.authService.redirectToPage(false);
      }
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.submitForm.valueChanges.subscribe(res=> {
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
    if (this.submitForm.invalid) {
        return;
    }
    try{
      this.isProcessing = true;
      this.submitForm.disable();
      const params = this.submitForm.value;
      this.loaderService.show();
      this.authService.resetSubmit(params)
        .subscribe(async res => {
          this.submitForm.enable();
          this.isProcessing = false;
          this.loaderService.hide();
          if (res.success) {
            this.otpModalInstance = new Modal(this.otpModal.nativeElement, {
              backdrop: 'static',
              keyboard: false  // Optional: Prevent closing with ESC key
            });
            if(this.otpModal.nativeElement.querySelectorAll("#otp input")) {
              this.otpModal.nativeElement.querySelectorAll("#otp input").forEach((res: HTMLInputElement)=> {
                res.value = null;
              })
            }
            this.otpModalInstance.show();
            this.startResendTimer(); // Start the timer when the modal is shown
          } else {
            if(res.message.toLowerCase().includes("not found")) {
              this.submitForm.setErrors({
                notFound: true
              });
              this.submitForm.controls.email.setErrors({
                notFound: true
              });
            }
            this.isProcessing = false;
            this.loaderService.hide();
            this.error = typeof res?.message !== "string" && Array.isArray(res.message) ? res.message[0] : res.message;
            this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
            this.loaderService.hide();
            this.modalService.openResultModal({
              success: false,
              header: "Error Email Submission!",
              description: this.error,
              confirm: ()=> {
                this.modalService.closeAll();
              }
            });
          }
        }, async (res) => {
          this.submitForm.enable();
          this.error = res.error.message;
          this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
          this.loaderService.hide();
        });
    } catch (e){
      this.submitForm.enable();
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
        this.submitForm.disable();
        this.loaderService.show();
        this.authService.resetVerify({
          otp: this.otp,
          email: this.submitForm.value.email,
        }).subscribe(async res=> {
          this.submitForm.enable();
          this.loaderService.hide();
          this.isProcessing = false;
          if(res.success && res.data) {
            this.otpModalInstance.hide();
            this.mode = "RESET";
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
          this.submitForm.enable();
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
          this.submitForm.enable();
        });
      }
    } catch(ex) {
      this.submitForm.enable();
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

  async onResetPrompt() {
    try {
      if (this.resetForm.invalid) {
          return;
      }
      this.modalService.openPromptModal({
        header: "Confirm Password Reset",
        description: "You are about to submit your new password. Do you want to proceed?",
        confirmText: "Submit Password",
        confirm: async () => {
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.onResetConfirm();
        }
      });
    } catch(ex) {
      this.modalService.closeAll();
    }
  }

  private onResetConfirm() {
    this.error = null;
    try {
      this.resetForm.markAllAsTouched();
      if(this.resetForm.valid && !this.resetForm.invalid ) {
        this.isProcessing = true;
        this.submitForm.disable();
        this.resetForm.disable();
        this.loaderService.show();
        this.authService.resetPassword({
          email: this.submitForm.value.email,
          otp: this.otp,
          password: this.resetForm.value.password,
          confirmPassword: this.resetForm.value.confirmPassword,
        }).subscribe(async res=> {
          this.submitForm.enable();
          this.resetForm.enable();
          if(res.success) {
            this.mode = "SUBMIT";
            await this.loaderService.hide();
            this.isProcessing = false;
            this.submitForm.reset();
            this.otp = "";
            this.resetForm.reset();
            this.modalService.openResultModal({
              success: true,
              header: "Password Changed!",
              description: 'Your password has been change successfully!',
              confirm: ()=> {
                this.modalService.closeAll();
              }
            });

          } else {
            this.isProcessing = false;
            this.loaderService.hide();
            this.error = typeof res?.message !== "string" && Array.isArray(res.message) ? res.message[0] : res.message;
            this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
            this.modalService.openResultModal({
              success: false,
              header: "Error!",
              description: 'Oops, ' + this.error,
              confirm: ()=> {
                this.modalService.closeAll();
              }
            });
          }
        }, async (err)=> {
          this.submitForm.enable();
          this.resetForm.enable();
          this.error = err?.message ? err?.message.toString() : err?.toString();
          this.isProcessing = false;
          this.loaderService.hide();
          this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
          this.modalService.openResultModal({
            success: false,
            header: "Error!",
            description: 'Oops, ' + this.error,
            confirm: ()=> {
              this.modalService.closeAll();
            }
          });
        }, async ()=> {
          this.submitForm.enable();
          this.resetForm.enable();
        });
      }
    } catch(ex) {
      this.submitForm.enable();
      this.resetForm.enable();
      this.error = ex?.message ? ex?.message.toString() : ex?.toString();
      this.isProcessing = false;
      this.loaderService.hide();
      this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
      this.modalService.openResultModal({
        success: false,
        header: "Error!",
        description: 'Oops, ' + this.error,
        confirm: ()=> {
          this.modalService.closeAll();
        }
      });
    }
  }
}
