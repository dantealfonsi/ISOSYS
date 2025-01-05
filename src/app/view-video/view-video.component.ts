import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, SimpleChanges, OnChanges, AfterViewInit, Renderer2 } from '@angular/core';
import { VideoTrackingService } from '../video-tracking.service';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { MatIconModule } from '@angular/material/icon';
import { UserNavbarComponent } from '../../assets/user-navbar/user-navbar.component';
import { FooterComponent } from '../../assets/footer/footer.component';
import { Router } from "@angular/router";
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-video',
  standalone: true,
  imports: [CommonModule, YouTubePlayerModule, MatTooltipModule, MatIconModule, UserNavbarComponent, FooterComponent, VgOverlayPlayModule, VgBufferingModule, VgCoreModule, VgControlsModule],
  templateUrl: './view-video.component.html',
  styleUrl: './view-video.component.css'
})
export class ViewVideoComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input() videoUrl: string | undefined;
  @Input() lessonId: number | undefined;
  private intervalId: any;
  videoDuration: number | undefined;
  private player: YT.Player | undefined;
  @ViewChild('singleVideo', { static: false }) singleVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('youtubePlayer', { static: false }) youtubePlayer!: ElementRef;

  screenWidth: number = 0;
  constructor(private videoTrackingService: VideoTrackingService, private renderer: Renderer2) { }

  ngOnInit(): void {
    if (this.lessonId !== undefined) {
      this.videoTrackingService.setLessonId(this.lessonId);
    }
    this.screenWidth = window.innerWidth;

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoUrl'] && !changes['videoUrl'].isFirstChange()) {
      this.resetPlayer();
      if (this.lessonId !== undefined) {
        this.videoTrackingService.setLessonId(this.lessonId);
      }
    }
  }

  ngAfterViewInit(): void {

    this.initializePlayer();
    // Verifica repetidamente hasta que el iframe esté presente
    const checkIframe = () => {
      const iframe = document.getElementById('widget2');
      if (iframe) {
        iframe.style.width = '100%'; // 100% del ancho del contenedor
        if (window.innerWidth <= 950) {
          iframe.style.height = `${iframe.offsetWidth * 3 / 4}px`; // Relación de aspecto 4:3
        } else {
          iframe.style.height = `${iframe.offsetWidth * 9 / 16}px`; // Relación de aspecto 16:9
        }
      } else {
        // Vuelve a verificar después de 100ms
        setTimeout(checkIframe, 100);
      }
    };

    // Comienza la verificación
    checkIframe();
  }


  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.player) {
      this.player.destroy();
    }
  }

  isMp4(url: string): boolean {
    return url.endsWith('.mp4');
  }

  isYouTubeVideo(url: string): boolean {
    return !url.endsWith('.mp4');
  }

  initializePlayer(): void {
    if (this.isYouTubeVideo(this.videoUrl!)) {
      this.setupYouTubePlayer();
    } else {
      this.setupMP4Player();
    }
  }

  resetPlayer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.videoTrackingService.resetWatchedTime();
    if (this.player) {
      this.player.destroy();
      this.player = undefined;
    }
    this.clearVideoElement();
    setTimeout(() => {
      this.initializePlayer();
    });
  }

  clearVideoElement(): void {
    if (this.singleVideo && this.singleVideo.nativeElement) {
      this.singleVideo.nativeElement.src = ''; // Forzar actualización de src para videos MP4
      this.singleVideo.nativeElement.load(); // Recargar el elemento de video
    }
    if (this.youtubePlayer) {
      this.youtubePlayer.nativeElement.innerHTML = ''; // Limpiar el contenido del reproductor de YouTube
    }
  }

  setupMP4Player(): void {
    if (this.singleVideo && this.singleVideo.nativeElement) {
      const video = this.singleVideo.nativeElement;
      video.src = this.getFullVideoUrl(this.videoUrl!); // Actualizar la URL del video con la ruta completa
      video.addEventListener('loadedmetadata', () => {
        const duration = video.duration;
        this.videoTrackingService.setVideoDuration(duration);
        console.log(`Duración del video: ${duration} segundos`);
      });

      let lastTimeUpdate = 0;

      video.addEventListener('timeupdate', () => {
        const currentTime = video.currentTime;
        if (Math.floor(currentTime) > lastTimeUpdate) {
          lastTimeUpdate = Math.floor(currentTime);
          this.videoTrackingService.updateVideoTime(1);
          console.log(`Tiempo transcurrido: ${currentTime} segundos`);
          console.log(`Tiempo efectivo visto: ${this.videoTrackingService.getTotalWatchedTime()} segundos`);
        }
      });

      video.addEventListener('ended', () => {
        this.videoTrackingService.videoCompleted();
        console.log('Video completado');
      });
    }
  }

  setupYouTubePlayer(): void {
    const onPlayerReady = (event: YT.PlayerEvent) => {
      const player = event.target;
      const totalDuration = player.getDuration();
      this.videoTrackingService.setVideoDuration(totalDuration);
      console.log(`Duración del video de YouTube: ${totalDuration} segundos`);
    };

    const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
      const player = event.target;
      if (event.data == YT.PlayerState.ENDED) {
        this.videoTrackingService.videoCompleted();
        console.log('Video de YouTube completado');
        clearInterval(this.intervalId); // Detener el conteo cuando el video termine
        this.intervalId = null; // Asegurar que el intervalo se establezca como null
      } else if (event.data == YT.PlayerState.PLAYING) {
        if (!this.intervalId) {
          this.intervalId = setInterval(() => {
            const currentTime = player.getCurrentTime();
            this.videoTrackingService.updateVideoTime(1);
            console.log(`Tiempo transcurrido (YouTube): ${currentTime} segundos`);
            console.log(`Tiempo efectivo visto: ${this.videoTrackingService.getTotalWatchedTime()} segundos`);
          }, 1000);
        }
      } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.BUFFERING) {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }
    };

    if (this.youtubePlayer) {
      this.player = new YT.Player(this.youtubePlayer.nativeElement, {
        videoId: this.videoUrl!,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }
  }

  getFullVideoUrl(url: string): string {
    // Construir la URL completa si es necesaria
    if (!url.startsWith('http://localhost/iso2sys_rest_api/videos/')) {
      return `http://localhost/iso2sys_rest_api/videos/${url}`;
    }
    return url;
  }

}

