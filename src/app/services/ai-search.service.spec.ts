import { TestBed } from '@angular/core/testing';

import { AiSearchService } from './ai-search.service';

describe('AiSearchService', () => {
  let service: AiSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
