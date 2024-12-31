import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoTrackingService {
  private videoTimeSource = new BehaviorSubject<number>(0);
  private videoCompletedSource = new BehaviorSubject<boolean>(false);
  private totalWatchedTime: number = 0;
  private videoDuration: number = 0;
  private checkpoints: Set<number> = new Set([25, 50, 75, 90, 95]);
  private lessonId: number | undefined;
  private hasPostedProgress: boolean = false; // Bandera para la solicitud POST

  videoTime$ = this.videoTimeSource.asObservable();
  videoCompleted$ = this.videoCompletedSource.asObservable();

  constructor() {
    this.loadProgress();
  }

  videoCompleted() {
    this.videoCompletedSource.next(true);
  }

  resetWatchedTime() {
    this.totalWatchedTime = 0;
    this.hasPostedProgress = false; // Reiniciar la bandera al reiniciar el tiempo visto
  }

  updateVideoTime(time: number) {
    this.totalWatchedTime += time;
    this.checkAndSaveProgress();
  }

  getTotalWatchedTime() {
    return this.totalWatchedTime;
  }

  setVideoDuration(duration: number) {
    this.videoDuration = duration;
  }

  setLessonId(lessonId: number) {
    this.lessonId = lessonId;
    this.loadProgress();
  }

  private checkAndSaveProgress() {
    if (this.isSessionActive() && this.videoDuration > 0 && this.lessonId !== undefined) {
      const progressPercentage = (this.totalWatchedTime / this.videoDuration) * 100;
      this.checkpoints.forEach(checkpoint => {
        if (progressPercentage >= checkpoint && !localStorage.getItem(`checkpoint_${checkpoint}_${this.lessonId}`)) {
          this.saveProgress(checkpoint, progressPercentage);
          if (checkpoint === 90 && !this.hasPostedProgress) {
            this.postProgress(progressPercentage);
            this.hasPostedProgress = true; // Marcar la solicitud como enviada
          }
        }
      });
    }
  }

  private saveProgress(checkpoint: number, progressPercentage: number) {
    const token = JSON.parse(localStorage.getItem('token') || '{}');
    const userId = token.id;
    if (userId && this.lessonId !== undefined) {
      const key = `${userId}_${this.lessonId}_lesson_videos`;
      const value = {
        userId,
        lessonId: this.lessonId,
        progressPercentage: progressPercentage.toFixed(2) // Guardar el porcentaje con dos decimales
      };
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`Checkpoint ${checkpoint}% alcanzado y guardado en localStorage:`, value);
    }
  }

  private postProgress(progressPercentage: number) {
    const token = JSON.parse(localStorage.getItem('token') || '{}');
    const userId = token.id;
    if (userId && this.lessonId !== undefined) {
      const datos = {
        addViewedVideo: "",
        lesson: this.lessonId,
        user: userId,
        progressPercentage: progressPercentage.toFixed(2)
      };

      fetch('http://localhost/iso2sys_rest_api/server.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Progreso enviado:', data);
      })
      .catch(error => {
        console.error('Error al enviar el progreso:', error);
      });
    }
  }

  private loadProgress() {
    const token = JSON.parse(localStorage.getItem('token') || '{}');
    const userId = token.id;
    if (userId && this.lessonId !== undefined) {
      const key = `${userId}_${this.lessonId}_lesson_videos`;
      const savedProgress = localStorage.getItem(key);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        this.totalWatchedTime = (progress.progressPercentage / 100) * this.videoDuration;
        console.log(`Progreso cargado: ${this.totalWatchedTime} segundos (${progress.progressPercentage}%)`);
      }
    }
  }

  private isSessionActive(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && token !== '';
  }
}
