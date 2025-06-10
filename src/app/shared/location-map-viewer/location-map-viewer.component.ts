import { Component, EventEmitter, Input, Output, AfterViewInit, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { GeoLocationService } from 'src/app/services/geo-location.service';
import { v4 as uuidv4 } from 'uuid';
import { GoogleMap, GoogleMapsModule, MapMarker } from '@angular/google-maps';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from 'src/environments/environment';

@Component({
  standalone: true,
  imports: [
    GoogleMapsModule
  ],
  selector: 'app-location-map-viewer',
  templateUrl: './location-map-viewer.component.html',
  styleUrls: ['./location-map-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LocationMapViewerComponent implements OnInit, AfterViewInit {
  readonly mapId: string = 'map-' + uuidv4(); // ✅ Unique map ID using UUID
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap | undefined;
  @ViewChild(MapMarker) marker!: MapMarker;
  private readOnly = false;
  zoom = 15;
  @Input() center: google.maps.LatLngLiteral;
  markerPosition: google.maps.LatLngLiteral;

  mapOptions: google.maps.MapOptions = this.getMapOptions();
  markerOptions: google.maps.MarkerOptions = this.getMarkerOptions();
  @Output() onMarkerChange = new EventEmitter<{ lat: number; lng: number }>();

  @Input() set isReadOnly(value: boolean) {
    this.readOnly = value;
    this.mapOptions = this.getMapOptions();
    this.markerOptions = this.getMarkerOptions();
  };

  currentCoords: {
    lat: number;
    lng: number;
  }

  constructor(
    private http: HttpClient,
    private readonly geoLocationService: GeoLocationService
  ) {
    this.geoLocationService.data$.subscribe((pos: GeolocationPosition) => {
      if (pos?.coords && (!this.currentCoords || !this.currentCoords?.lat || !this.currentCoords?.lng)) {
        this.currentCoords = {
          lat: pos.coords?.latitude,
          lng: pos.coords?.longitude,
        };
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.geoLocationService.data$.subscribe((pos: GeolocationPosition) => {
      if (pos?.coords) {
        const { latitude, longitude } = pos.coords;
        // this.initMap();
      }
    });
  }


  ngAfterViewInit(): void {
    this.mapOptions = this.getMapOptions();
    // Ensures dragend works for some edge cases
    if (this.marker?.marker) {
      this.marker.marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (lat && lng) this.updateLocation(lat, lng);
      });
    }
  }

  getMapOptions(): google.maps.MapOptions {
    return {
      disableDefaultUI: true,
      gestureHandling: this.readOnly ? 'none' : 'auto',
      draggable: !this.readOnly,
      clickableIcons: !this.readOnly,
      zoomControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false
    };
  }

  getMarkerOptions(): google.maps.MarkerOptions {
    return {
      draggable: !this.readOnly
    };
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (this.readOnly || !event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.updateLocation(lat, lng);
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    console.log(event);
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.onMarkerChange.emit({ lat, lng });
    this.updateLocation(lat, lng);
  }

  updateLocation(lat: number, lng: number) {
    if ((!lat || !lng) && this.currentCoords) {
      lat = this.currentCoords.lat;
      lng = this.currentCoords.lng;
    }
    this.markerPosition = { lat, lng };
    this.center = { lat, lng };

    // Smooth fly-over animation
    if (this.map) {
      this.map.panTo({ lat, lng });
    }
  }
}
