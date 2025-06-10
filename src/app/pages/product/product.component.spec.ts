import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Productomponent } from './product.component';

describe('Productomponent', () => {
  let component: Productomponent;
  let fixture: ComponentFixture<Productomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Productomponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Productomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
