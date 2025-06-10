import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickProductViewModalComponent } from './quick-product-view-modal.component';

describe('QuickProductViewModalComponent', () => {
  let component: QuickProductViewModalComponent;
  let fixture: ComponentFixture<QuickProductViewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickProductViewModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickProductViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
