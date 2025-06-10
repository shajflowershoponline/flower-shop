import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerUser } from 'src/app/model/customer-user';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerUserService } from 'src/app/services/customer-user.service';
import { GeoLocationService } from 'src/app/services/geo-location.service';
import { LoaderService } from 'src/app/services/loader.service';
import { MODAL_TYPE, ModalService } from 'src/app/services/modal.service';
import { OneSignalService } from 'src/app/services/one-signal.service';
import { StorageService } from 'src/app/services/storage.service';
import { LocationMapViewerComponent } from 'src/app/shared/location-map-viewer/location-map-viewer.component';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
})
export class AddressComponent implements OnInit {
  form = new FormGroup({
    address: new FormControl(null, [Validators.required]),
    addressLandmark: new FormControl(),
    addressCoordinates: new FormControl(null, [Validators.required]),
  });
  submitted = false;
  error: string;
  isProcessing = false;
  currentUser: CustomerUser;
  modalInstance;
  @ViewChild('locationMapViewer') locationMapViewer!: LocationMapViewerComponent;
  constructor(
    private route: ActivatedRoute,
    private customerUserService: CustomerUserService,
    private authService: AuthService,
    private storageService: StorageService,
    private oneSignalService: OneSignalService,
    private geoLocationService: GeoLocationService,
    private loaderService: LoaderService,
    private modalService: ModalService,
    private snackBar: MatSnackBar,
    private router: Router) {
      this.currentUser = this.storageService.getCurrentUser();
      this.geoLocationService.data$.subscribe((pos: GeolocationPosition) => {
        if (pos?.coords && (!this.currentUser?.addressCoordinates || !this.currentUser?.addressCoordinates?.lat || !this.currentUser?.addressCoordinates?.lng)) {
           this.currentUser.addressCoordinates = {
            lat: pos.coords?.latitude,
            lng: pos.coords?.longitude,
           };
           if(!this.form.value?.addressCoordinates?.lat || this.form.value?.addressCoordinates?.lng) {
            this.form.get("addressCoordinates").setValue(this.currentUser.addressCoordinates);
           }
           this.loadMap();
        }
      });
  }
  ngOnInit(): void {
    this.form.patchValue({
      address: this.currentUser?.address,
      addressCoordinates: this.currentUser?.addressCoordinates,
    })
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.loadMap();
  }

  loadMap() {
    if(this.currentUser?.addressCoordinates) {
      this.locationMapViewer.updateLocation(this.currentUser?.addressCoordinates?.lat, this.currentUser?.addressCoordinates?.lng);
    }
  }

  get isAuthenticated() {
    return this.currentUser && this.currentUser?.customerUserCode;
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
        header: "Save Address?",
        description: "You're about to save the selected address. Do you want to continue?",
        confirmText: "Save Changes",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.onSaveChanges();
        }
      });
    } catch(ex) {
      this.modalService.closeAll();
    }
  }

  async onSaveChanges() {
    try{
      this.form.disable();
      this.isProcessing = true;
      const params = this.form.value;
      this.loaderService.show();
      this.customerUserService.updateProfile(this.currentUser?.customerUserCode, {
        ...this.currentUser,
        address: this.form.value.address,
        addressLandmark: this.form.value.addressLandmark,
        addressCoordinates: this.form.value.addressCoordinates,
      })
        .subscribe(async res => {
          this.isProcessing = false;
          this.loaderService.hide();
          this.error = null;
          this.form.enable();
          if (res.success) {
            this.modalService.openResultModal({
              success: true,
              header: "Address Saved Successfully!",
              description: "The selected address has been saved and updated in your profile.",
              confirm: ()=> {
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
            this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
            this.loaderService.hide();
            this.modalService.openResultModal({
              success: false,
              header: "Failed to Save Address!",
              description: this.error,
              confirm: ()=> {
                this.modalService.closeAll();
              }
            });
          }
        }, async (res) => {
          this.form.enable();
          this.error = null;
          this.isProcessing = false;
          this.loaderService.hide();
          this.error = res.error.message;
          this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
          this.loaderService.hide();
          this.modalService.openResultModal({
            success: false,
            header: "Failed to Save Address!",
            description: this.error,
            confirm: ()=> {
              this.modalService.closeAll();
            }
          });
        });
    } catch (e){
        this.form.enable();
        this.error = null;
        this.isProcessing = false;
        this.loaderService.hide();
        this.error = Array.isArray(e.message) ? e.message[0] : e.message;
        this.snackBar.open(this.error, 'close', {panelClass: ['style-error']});
        this.loaderService.hide();
        this.modalService.openResultModal({
          success: false,
          header: "Failed to Save Address!",
          description: this.error,
          confirm: ()=> {
            this.modalService.closeAll();
          }
        });
    }
  }

  onLocationSelected(event: { selectedCoords: { lat: number, lng: number }; address: string; }) {
    console.log(event);
    if(event) {
      this.form.patchValue({
        address: event.address,
        addressCoordinates: event.selectedCoords,
      });

      this.form.markAsDirty();
      this.form.markAllAsTouched();
      this.locationMapViewer.updateLocation(event.selectedCoords.lat, event.selectedCoords.lng);
      this.locationMapViewer.map.googleMap.setCenter(event.selectedCoords);
    }
  }
}
