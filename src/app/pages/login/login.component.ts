import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { OneSignalService } from 'src/app/services/one-signal.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });
  submitted = false;
  error: string;
  isProcessing = false;
  ref;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private storageService: StorageService,
    private oneSignalService: OneSignalService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    private router: Router) {
      const user = this.storageService.getCurrentUser();
      if(user) {
        this.authService.redirectToPage(false);
      }
      this.route.queryParams.subscribe(params => {
        this.ref = params['ref'];
        console.log('Query param value: ', this.ref);
      });
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.form.valueChanges.subscribe(res=> {
      this.error = null;
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
        return;
    }
    try{
      const params = this.form.value;
      this.loaderService.show();
      this.authService.login(params)
        .subscribe(async res => {
          if (res.success) {
            this.oneSignalService.init();
            this.storageService.saveCurrentUser(res.data);
            this.loaderService.hide();
            if(this.ref && this.ref !== "") {
              window.location.href = this.ref;
            } else {
              window.location.href = "/";
            }
          } else {
            if(res.message.toLowerCase().includes("not found")) {
              this.form.setErrors({
                notFound: true
              });
              this.form.controls.email.setErrors({
                notFound: true
              });
            }
            if(res.message.toLowerCase().includes("incorrect") && res.message.toLowerCase().includes("password")) {
              this.form.setErrors({
                incorrect: true
              });
              this.form.controls.password.setErrors({
                incorrect: true
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
}
