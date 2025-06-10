import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationMapViewerComponent } from './location-map-viewer.component';

describe('LocationMapViewerComponent', () => {
  let component: LocationMapViewerComponent;
  let fixture: ComponentFixture<LocationMapViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationMapViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationMapViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
