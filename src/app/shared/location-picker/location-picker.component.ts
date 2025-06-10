import { Component, OnInit, AfterViewInit, Inject, Input, Output, ViewChild, EventEmitter, ViewEncapsulation, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LocationMapViewerComponent } from '../location-map-viewer/location-map-viewer.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { SystemConfigService } from 'src/app/services/system-config.service';
import { GeoLocationService } from 'src/app/services/geo-location.service';
@Component({
  standalone: true,
  imports: [LocationMapViewerComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,],
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LocationPickerComponent implements OnInit {
  @ViewChild('locationPickerModal') modalElement!: ElementRef;
  autocompleteService = new google.maps.places.AutocompleteService();
  geocoder = new google.maps.Geocoder();
  placesService: google.maps.places.PlacesService;
  searchKey = '';
  placeResults: { description?: string; place_id: string; main_text?: string }[] = [];

  selectedCoords = { lat: 0, lng: 0 };

  modalRef: any;
  // Existing code...
  @ViewChild('locationMapViewer') locationMapViewer!: LocationMapViewerComponent;

  @Output() onLocationSelected = new EventEmitter<{ selectedCoords: { lat: number, lng: number }; address: string; }>();
  constructor(
    private http: HttpClient,
    private systemConfigService: SystemConfigService,
    private geoLocationService: GeoLocationService,
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.placesService = new google.maps.places.PlacesService(this.locationMapViewer.map.googleMap);
  }

  show(location: { lat: 0, lng: 0 }, label = "") {
    if(!label) {
      this.getCode(location);
    }
    if (this.modalElement) {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement, {
        backdrop: 'static', // optional: prevents closing by clicking outside
        keyboard: false, // optional: disables escape key
      });
      this.modalRef.show();
    }

    if(location) {
      this.locationMapViewer.updateLocation(location.lat, location.lng);
      this.locationMapViewer.map.googleMap.setCenter(location);
      this.selectedCoords = { lat: location.lat, lng: location.lng };
      this.searchKey = label;
    }
  }

  placeSearchSelected(location) {
    this.placeResults = [];
    this.searchKey = location.description;
    this.placesService.getDetails({ placeId: location.place_id }, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // Get the coordinates
        this.locationMapViewer.updateLocation(place.geometry.location.lat(), place.geometry.location.lng());
        this.locationMapViewer.map.googleMap.setCenter(place.geometry.location);
        this.selectedCoords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      }
    });
  }

  onSearchChange(value: any) {
    // console.log(value);
    if (value && value !== '') {
      // Perform autocomplete prediction request
      this.autocompleteService.getPlacePredictions(
        { input: value },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Process the predictions (results)
            this.placeResults = predictions.map(r => {
              return {
                description: r.description,
                place_id: r.place_id,
                main_text: r.structured_formatting.main_text
              }
            });
          } else {
            console.error(
              'Autocomplete prediction request failed with status:',
              status
            );
          }
        }
      );
    } else {
      this.placeResults = []; // Hide dropdown
      this.selectedCoords = null;
    }
  }

  getCode(coords: { lat: number; lng: number }) {
    this.geocoder.geocode({
      location: {
        lat: Number(coords?.lat),
        lng: Number(coords?.lng),
      }
    }).then(res => {
      this.searchKey = res.results && res.results.length > 0 ? res.results[0]?.formatted_address : null;
    });
  }


  onMarkerChanged(coords: { lat: number; lng: number }) {
    this.selectedCoords = coords;
    this.getCode(coords);
  }


  onConfirm() {
    this.modalRef.hide();
    this.onLocationSelected.emit({
      selectedCoords: this.selectedCoords,
      address: this.searchKey,
    });

    this.searchKey = null;
    // this.locationMapViewer.updateMapPin(this.locationMapViewer.currentCoords.lat, this.locationMapViewer.currentCoords.lng);
  }

  onCancel() {
    this.modalRef.hide();
  }
}
