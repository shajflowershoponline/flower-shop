import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerUser } from 'src/app/model/customer-user';
import { EmailService } from 'src/app/services/email.service';
import { LoaderService } from 'src/app/services/loader.service';
import { MODAL_TYPE, ModalService } from 'src/app/services/modal.service';
import { StorageService } from 'src/app/services/storage.service';
import { SystemConfigService } from 'src/app/services/system-config.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  currentUser: CustomerUser;
  location = "";
  locationCoordinates = "";
  mobilePhone = "";
  email = "";

  submitted = false;
  error: string;
  isProcessing = false;
  form = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    subject: new FormControl(null, [Validators.required]),
    message: new FormControl(null, [Validators.required]),
  });
  constructor(
    private snackBar: MatSnackBar,
    private loaderService: LoaderService,
    private storageService: StorageService,
    private emailService: EmailService,
    private modalService: ModalService,
    private systemConfigService: SystemConfigService,
  ) {
    this.currentUser = this.storageService.getCurrentUser();
  }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    this.location = this.systemConfigService.get("STORE_LOCATION_NAME");
    this.locationCoordinates = this.systemConfigService.get("STORE_LOCATION_COORDINATES");
    this.locationCoordinates = this.locationCoordinates.split(" ").join("");
    this.mobilePhone = this.systemConfigService.get("STORE_MOBILE_NUMBER");
    this.email = this.systemConfigService.get("STORE_SUPPORT_EMAIL");
  }

  onSubmit() {
    try {
      this.modalService.openPromptModal({
        header: "Submit Contact Form",
        description: "Are you sure you want to send your message to our support team?",
        confirmText: "Submit",
        confirm: () => {
          this.form.disable();
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.isProcessing = true;
          this.loaderService.show();
          this.emailService.sendEmailFromContact(this.form.value).subscribe(res => {
            this.isProcessing = false;
            this.loaderService.hide();
            this.form.enable();
            if (res.success) {
              this.form.reset();
              this.modalService.openResultModal({
                success: true,
                header: "Message Sent!",
                description: "Thank you for contacting us. We’ll get back to you shortly.",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                }
              });
            } else {
              this.error = "Failed to send your message. Please try again later.";
              this.modalService.openResultModal({
                success: false,
                header: "Error Saving Changes!",
                description: this.error,
                confirm: () => {
                  this.modalService.closeAll();
                }
              });
            }
          }, (res) => {
            this.form.enable();
            this.isProcessing = false;
            this.loaderService.hide();
            this.error = "Failed to send your message. Please try again later.";
            this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
            this.loaderService.hide();
            this.modalService.openResultModal({
              success: false,
              header: "Something Went Wrong!",
              description: "Failed to send your message. Please try again later.",
              confirm: () => {
                this.modalService.closeAll();
              }
            });
          });
        }
      });
    } catch (ex) {
      this.form.enable();
      this.isProcessing = false;
      this.loaderService.hide();
      this.error = "Failed to send your message. Please try again later.";
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.loaderService.hide();
      this.modalService.openResultModal({
        success: false,
        header: "Something Went Wrong!",
        description: "Failed to send your message. Please try again later.",
        confirm: () => {
          this.modalService.closeAll();
        }
      });
    }
  }
}
