import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AISearchComponent } from './ai-search.component';

describe('AISearchComponent', () => {
  let component: AISearchComponent;
  let fixture: ComponentFixture<AISearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AISearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AISearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
