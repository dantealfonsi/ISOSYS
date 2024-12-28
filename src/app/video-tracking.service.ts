import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoTrackingService {
  private videoTimeSource = new BehaviorSubject<number>(0);
  private videoCompletedSource = new BehaviorSubject<boolean>(false);

  videoTime$ = this.videoTimeSource.asObservable();
  videoCompleted$ = this.videoCompletedSource.asObservable();

  videoCompleted() {
    this.videoCompletedSource.next(true);
  }

  private totalWatchedTime: number = 0;

  resetWatchedTime() {
    this.totalWatchedTime = 0;
  }

  updateVideoTime(time: number) {
    this.totalWatchedTime += time;
  }

  getTotalWatchedTime() {
    return this.totalWatchedTime;
  }
  

  
}
