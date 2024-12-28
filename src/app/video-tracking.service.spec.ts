import { TestBed } from '@angular/core/testing';

import { VideoTrackingService } from './video-tracking.service';

describe('VideoTrackingService', () => {
  let service: VideoTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
