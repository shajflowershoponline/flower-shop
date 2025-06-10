import { TestBed } from '@angular/core/testing';

import { CustomerUserWishlistService } from './customer-user-wish-list.service';

describe('CustomerUserWishlistService', () => {
  let service: CustomerUserWishlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerUserWishlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
