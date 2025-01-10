import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
import { ViewVideoComponent } from "../view-video/view-video.component";
import { VideoTrackingService } from '../video-tracking.service';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-view-lessons',
  standalone: true,
  imports: [CommonModule, MatTabsModule, YouTubePlayerModule, MatTooltipModule, MatIconModule, UserNavbarComponent, FooterComponent, VgOverlayPlayModule, VgBufferingModule, VgCoreModule, VgControlsModule, ViewVideoComponent],
  templateUrl: './view-lessons.component.html',
  styleUrl: './view-lessons.component.css',
})

export class ViewLessonsComponent implements OnInit {

  unitsAndLessons: any[] = [];
  wholeUnitsAndLessons: any[] = [];

  itemId!: string | null;
  lesson_order!: string | null;
  lesson: any;
  isFirstLesson: boolean = false;
  isLastLesson: boolean = false;
  isFirstUnit: boolean = false;
  isLastUnit: boolean = false;
  currentLessonOrder!: number;
  url: string | undefined;

  videoUrl: string = 'http://localhost/iso2sys_rest_api/videos/prueba.mp4';


  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public router: Router,
    public videoTrackingService: VideoTrackingService
  ) { }


  async unitsAndLessonsListRecover() {
    try {
      const response = await fetch(
        "http://localhost/iso2sys_rest_api/server.php?units_and_lessons_list="
      );
      if (!response.ok) {
        throw new Error("Error en la solicitud: " + response.status);
      }
      const data = await response.json();
      console.log("Datos recibidos:", data);
      return data; // Devuelve los datos
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }



  async this_specific_lesson_recover() {
    function extractVideoId(url: string) {
      let videoId;

      if (url.includes('youtu.be')) {
        // Shortened URL
        videoId = url.split('youtu.be/')[1];
      } else if (url.includes('youtube.com')) {
        // Standard URL
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v');
      }

      return videoId;
    }

    try {
      const response = await fetch(
        `http://localhost/iso2sys_rest_api/server.php?this_specific_lesson_list=&id=${this.itemId}&lesson_order=${this.lesson_order}`
      );
      if (!response.ok) {
        throw new Error('Error en la solicitud: ' + response.status);
      }
      const data = await response.json();
      console.log('Datos recibidos:', data);

      // Assuming data.url contains the video URL
      if (data.url) {
        if (data.url.includes('.mp4')) {
          console.log('Detected .mp4 URL:', data.url);
          // Do not change the URL if it's an MP4 file
        } else {
          const videoId = extractVideoId(data.url);
          console.log('Extracted Video ID:', videoId);
          data.url = videoId; // Add the videoId to the data object
        }
      }
      return data;
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }



  filterUnitsAndLessons(unitsAndLessons: any[], itemId: any) { return unitsAndLessons.filter(unit => unit.id === itemId); }


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.itemId = this.route.snapshot.paramMap.get('id');
      this.lesson_order = this.route.snapshot.paramMap.get('lesson_order');

      this.loadLesson();
    });
  }

  async loadLesson() {
    this.lesson = await this.this_specific_lesson_recover();
    this.wholeUnitsAndLessons = await this.unitsAndLessonsListRecover();

    this.unitsAndLessonsListRecover()
      .then(data => {
        this.unitsAndLessons = this.filterUnitsAndLessons(data, this.itemId);
        console.log("Unidades y lecciones filtradas:", this.unitsAndLessons);

        // Aseguramos que unitsAndLessons y sus propiedades están definidos
        if (this.unitsAndLessons.length > 0 && this.unitsAndLessons[0].lessons.length > 0) {
          this.url = this.unitsAndLessons[0].lessons[0].url;
        }

        // Ahora que unitsAndLessons está inicializado, llamamos a checkForNoPreviousLesson
        this.checkForNoPreviousLesson();
        this.checkForNoPreviousUnit();
        this.checkIfLastLesson();
        this.checkForLastUnit();
      })
      .catch(error => {
        console.error('Error recuperando las unidades y lecciones:', error);
      });

    // Aseguramos que lesson no es undefined antes de acceder a url
    if (this.lesson) {
      this.url = this.lesson.url;
    }
  }


  firstLetterUpperCase(word: string): string {
    return word.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
  }

  capitalizeWords(value: string | null): string {
    if (!value) {
      return '';
    }
    return value.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }


  goToLesson(unitId: number, lessonOrder: number) {
    const lesson = this.unitsAndLessons[0]?.lessons.find((lesson: { lesson_order: number; }) => lesson.lesson_order === lessonOrder);
    if (lesson) {
      this.videoUrl = ''; // Resetea la URL del video temporalmente
      setTimeout(() => {
        this.videoUrl = lesson.url; // Asigna la nueva URL del video después de un pequeño retraso
      });
    } else {
      this.videoUrl = '';
    }
    this.videoTrackingService.resetWatchedTime();
    this.router.navigate(['/view-lessons', unitId, lessonOrder]);
  }


  goToExam(unitId: string, lesson_id: string): void {
    this.router.navigate(['/view-exam', unitId, lesson_id]);
  }

  goBack() {
    this.router.navigate(['/view-units']);
  }


  isMp4(url: string): boolean { return url.includes('.mp4'); }



  goToNextLesson() {
    const unitIdParam = this.route.snapshot.paramMap.get('id');
    const lessonOrderParam = this.route.snapshot.paramMap.get('lesson_order');

    console.log('unitIdParam:', unitIdParam);
    console.log('lessonOrderParam:', lessonOrderParam);

    if (unitIdParam && lessonOrderParam) {
      const unitId = +unitIdParam;
      const lessonOrder = +lessonOrderParam;

      console.log('unitId:', unitId);
      console.log('lessonOrder:', lessonOrder);

      const unit = this.unitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);

      console.log('unit:', unit);

      if (unit) {
        // Encontrar la lección actual
        const nextLesson = unit.lessons.find((lesson: { lesson_order: number; }) => lesson.lesson_order > lessonOrder);

        console.log('nextLesson:', nextLesson);

        if (nextLesson) {
          this.videoUrl = ''; // Resetea la URL del video temporalmente
          setTimeout(() => {
            this.videoUrl = nextLesson.url; // Asigna la nueva URL del video después de un pequeño retraso
            console.log('videoUrl asignado:', this.videoUrl);
          });

          this.videoTrackingService.resetWatchedTime();
          console.log('Tiempo de visualización reseteado');

          this.router.navigate(['/view-lessons', unitId, nextLesson.lesson_order]);
          console.log('Navegando a la siguiente lección:', unitId, nextLesson.lesson_order);
        } else {
          this.videoUrl = ''; // Si no hay siguiente lección, resetea la URL del video
          console.log('No hay siguiente lección, videoUrl reseteado');
        }
      } else {
        this.videoUrl = ''; // Si no se encuentra la unidad, resetea la URL del video
        console.log('Unidad no encontrada, videoUrl reseteado');
      }
    } else {
      this.videoUrl = ''; // Si no se encuentran los parámetros, resetea la URL del video
      console.log('Parámetros no encontrados, videoUrl reseteado');
    }
  }


  goToPreviousLesson() {
    const unitIdParam = this.route.snapshot.paramMap.get('id');
    const lessonOrderParam = this.route.snapshot.paramMap.get('lesson_order');

    console.log('unitIdParam:', unitIdParam);
    console.log('lessonOrderParam:', lessonOrderParam);

    if (unitIdParam && lessonOrderParam) {
      const unitId = +unitIdParam;
      const lessonOrder = +lessonOrderParam;

      console.log('unitId:', unitId);
      console.log('lessonOrder:', lessonOrder);

      const unit = this.unitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);

      console.log('unit:', unit);

      if (unit) {
        // Encontrar la lección actual
        const previousLesson = unit.lessons.reverse().find((lesson: { lesson_order: number; }) => lesson.lesson_order < lessonOrder);

        console.log('previousLesson:', previousLesson);

        if (previousLesson) {
          this.videoUrl = ''; // Resetea la URL del video temporalmente
          setTimeout(() => {
            this.videoUrl = previousLesson.url; // Asigna la nueva URL del video después de un pequeño retraso
            console.log('videoUrl asignado:', this.videoUrl);
          });

          this.videoTrackingService.resetWatchedTime();
          console.log('Tiempo de visualización reseteado');

          this.router.navigate(['/view-lessons', unitId, previousLesson.lesson_order]);
          console.log('Navegando a la lección anterior:', unitId, previousLesson.lesson_order);
        } else {
          this.videoUrl = ''; // Si no hay lección anterior, resetea la URL del video
          console.log('No hay lección anterior, videoUrl reseteado');
        }
      } else {
        this.videoUrl = ''; // Si no se encuentra la unidad, resetea la URL del video
        console.log('Unidad no encontrada, videoUrl reseteado');
      }
    } else {
      this.videoUrl = ''; // Si no se encuentran los parámetros, resetea la URL del video
      console.log('Parámetros no encontrados, videoUrl reseteado');
    }
  }

  lessonMenuVisible: boolean = false;

  toggleLessonMenu() {
    this.lessonMenuVisible = !this.lessonMenuVisible;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const windowWidth = (event.target as Window).innerWidth;
    if (windowWidth > 950) {
      this.lessonMenuVisible = false;
    }
  }




  checkForNoPreviousLesson() {
    const unitIdParam = this.route.snapshot.paramMap.get('id');
    const lessonOrderParam = this.route.snapshot.paramMap.get('lesson_order');

    if (unitIdParam && lessonOrderParam) {
      const unitId = +unitIdParam;
      const lessonOrder = +lessonOrderParam;
      const unit = this.unitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);
      if (unit) {
        const previousLesson = unit.lessons.slice().reverse().find((
          lesson: { lesson_order: number; }) => lesson.lesson_order < lessonOrder);
        if (!previousLesson) {
          this.isFirstLesson = true;
        } else{
          this.isFirstLesson = false;
        }
      } else {
        console.log('Unidad no encontrada, videoUrl reseteado');
        this.isFirstLesson = false;
      }
    } else {
      console.log('Parámetros no encontrados, videoUrl reseteado');
    }
  }

  checkIfLastLesson() {
    const unitIdParam = this.route.snapshot.paramMap.get('id');
    const lessonOrderParam = this.route.snapshot.paramMap.get('lesson_order');

    if (unitIdParam && lessonOrderParam) {

      const unitId = +unitIdParam;
      const lessonOrder = +lessonOrderParam;

      const unit = this.unitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);

      if (unit) {

        const nextLesson = unit.lessons.find((lesson: { lesson_order: number; }) => lesson.lesson_order > lessonOrder);

        if (!nextLesson) {
          this.isLastLesson = true;
        } else {
          this.isLastLesson = false;
        }
      } else {
        console.log('FALSO');
        this.isLastLesson = false;
      }
    } else {
      console.log('FALSO');
      this.isLastLesson = false;
    }
  }

  checkForNoPreviousUnit() {
    const unitIdParam = this.route.snapshot.paramMap.get('id');
  
    if (unitIdParam) {
      const unitId = +unitIdParam;
      const unit = this.wholeUnitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);
  
      if (unit) {
        // Encontrar la unidad anterior con el número menor más cercano al orden de la unidad actual
        const previousUnit = this.wholeUnitsAndLessons
          .filter((prevUnit: { order: string; }) => +prevUnit.order < +unit.order)
          .sort((a: { order: string; }, b: { order: string; }) => +b.order - +a.order)[0];
  
        if (!previousUnit) {
          this.isFirstUnit = true;
          console.log('No hay unidad anterior, es la primera unidad');
        } else {
          this.isFirstUnit = false;
          console.log('Unidad anterior encontrada:', previousUnit);
        }
      } else {
        console.log('Unidad no encontrada');
        this.isFirstUnit = false;
      }
    } else {
      console.log('Parámetros no encontrados');
      this.isFirstUnit = false;
    }
  }
  
  checkForLastUnit() {
    const unitIdParam = this.route.snapshot.paramMap.get('id');
  
    if (unitIdParam) {
      const unitId = +unitIdParam;
      const unit = this.wholeUnitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);
  
      if (unit) {
        // Encontrar la unidad siguiente con el número mayor más cercano al orden de la unidad actual
        const nextUnit = this.wholeUnitsAndLessons
          .filter((nextUnit: { order: string; }) => +nextUnit.order > +unit.order)
          .sort((a: { order: string; }, b: { order: string; }) => +a.order - +b.order)[0];
  
        if (!nextUnit) {
          this.isLastUnit = true;
          console.log('No hay unidad siguiente, es la última unidad');
        } else {
          this.isLastUnit = false;
          console.log('Unidad siguiente encontrada:', nextUnit);
        }
      } else {
        console.log('Unidad no encontrada');
        this.isLastUnit = false;
      }
    } else {
      console.log('Parámetros no encontrados');
      this.isLastUnit = false;
    }
  }
  
  
  goToNextUnit() {
    const unitIdParam = this.route.snapshot.paramMap.get('id');
    const lessonOrderParam = this.route.snapshot.paramMap.get('lesson_order');
  
    console.log('unitIdParam:', unitIdParam);
    console.log('lessonOrderParam:', lessonOrderParam);
  
    if (unitIdParam && lessonOrderParam) {
      const unitId = +unitIdParam;
      const lessonOrder = +lessonOrderParam;
  
      console.log('unitId:', unitId);
      console.log('lessonOrder:', lessonOrder);
  
      const unit = this.wholeUnitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);
  
      console.log('unit:', unit);
  
      if (unit) {
        // Encontrar la siguiente unidad con el número mayor más cercano al orden de la unidad actual
        const nextUnit = this.wholeUnitsAndLessons
          .filter((nextUnit: { order: number; }) => +nextUnit.order > +unit.order)
          .sort((a: { order: number; }, b: { order: number; }) => +a.order - +b.order)[0];
  
        console.log('nextUnit:', nextUnit);
  
        if (nextUnit) {
          // Encontrar la lección con el menor orden dentro de la siguiente unidad
          const nextLesson = nextUnit.lessons.reduce((prevLesson: { lesson_order: number; }, currLesson: { lesson_order: number; }) => {
            return (currLesson.lesson_order < prevLesson.lesson_order) ? currLesson : prevLesson;
          });
  
          console.log('nextLesson:', nextLesson);
  
          if (nextLesson) {
            this.videoUrl = ''; // Resetea la URL del video temporalmente
            setTimeout(() => {
              this.videoUrl = nextLesson.url; // Asigna la nueva URL del video después de un pequeño retraso
              console.log('videoUrl asignado:', this.videoUrl);
            });
  
            this.videoTrackingService.resetWatchedTime();
            console.log('Tiempo de visualización reseteado');
  
            this.router.navigate(['/view-lessons', nextUnit.id, nextLesson.lesson_order]);
            console.log('Navegando a la siguiente lección:', nextUnit.id, nextLesson.lesson_order);
          } else {
            this.videoUrl = ''; // Si no hay siguiente lección, resetea la URL del video
            console.log('No hay siguiente lección, videoUrl reseteado');
          }
        } else {
          this.videoUrl = ''; // Si no se encuentra la siguiente unidad, resetea la URL del video
          console.log('No se encuentra la siguiente unidad, videoUrl reseteado');
        }
      } else {
        this.videoUrl = ''; // Si no se encuentra la unidad actual, resetea la URL del video
        console.log('Unidad no encontrada, videoUrl reseteado');
      }
    } else {
      this.videoUrl = ''; // Si no se encuentran los parámetros, resetea la URL del video
      console.log('Parámetros no encontrados, videoUrl reseteado');
    }
  }

  goToPreviousUnit() {
    const unitIdParam = this.route.snapshot.paramMap.get('id');
    const lessonOrderParam = this.route.snapshot.paramMap.get('lesson_order');
  
    console.log('unitIdParam:', unitIdParam);
    console.log('lessonOrderParam:', lessonOrderParam);
  
    if (unitIdParam && lessonOrderParam) {
      const unitId = +unitIdParam;
      const lessonOrder = +lessonOrderParam;
  
      console.log('unitId:', unitId);
      console.log('lessonOrder:', lessonOrder);
  
      const unit = this.wholeUnitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);
  
      console.log('unit:', unit);
  
      if (unit) {
        // Encontrar la unidad anterior con el número menor más cercano al orden de la unidad actual
        const previousUnit = this.wholeUnitsAndLessons
          .filter((prevUnit: { order: string; }) => +prevUnit.order < +unit.order)
          .sort((a: { order: string; }, b: { order: string; }) => +b.order - +a.order)[0];
  
        console.log('previousUnit:', previousUnit);
  
        if (previousUnit) {
          // Encontrar la lección con el mayor orden dentro de la unidad anterior
          const previousLesson = previousUnit.lessons.reduce((prevLesson: { lesson_order: string; }, currLesson: { lesson_order: string; }) => {
            return (+currLesson.lesson_order > +prevLesson.lesson_order) ? currLesson : prevLesson;
          }, previousUnit.lessons[0]);
  
          console.log('previousLesson:', previousLesson);
  
          if (previousLesson) {
            this.videoUrl = ''; // Resetea la URL del video temporalmente
            setTimeout(() => {
              this.videoUrl = previousLesson.url; // Asigna la nueva URL del video después de un pequeño retraso
              console.log('videoUrl asignado:', this.videoUrl);
            });
  
            this.videoTrackingService.resetWatchedTime();
            console.log('Tiempo de visualización reseteado');
  
            this.router.navigate(['/view-lessons', previousUnit.id, previousLesson.lesson_order]);
            console.log('Navegando a la lección anterior:', previousUnit.id, previousLesson.lesson_order);
          } else {
            this.videoUrl = ''; // Si no hay lección anterior, resetea la URL del video
            console.log('No hay lección anterior, videoUrl reseteado');
          }
        } else {
          this.videoUrl = ''; // Si no se encuentra la unidad anterior, resetea la URL del video
          console.log('No se encuentra la unidad anterior, videoUrl reseteado');
        }
      } else {
        this.videoUrl = ''; // Si no se encuentra la unidad actual, resetea la URL del video
        console.log('Unidad no encontrada, videoUrl reseteado');
      }
    } else {
      this.videoUrl = ''; // Si no se encuentran los parámetros, resetea la URL del video
      console.log('Parámetros no encontrados, videoUrl reseteado');
    }
  }
  
  

  

  
  goToPreviousUnit2() {
    const unitIdParam = this.route.snapshot.paramMap.get('id');
    const lessonOrderParam = this.route.snapshot.paramMap.get('lesson_order');
  
    console.log('unitIdParam:', unitIdParam);
    console.log('lessonOrderParam:', lessonOrderParam);
  
    if (unitIdParam && lessonOrderParam) {
      const unitId = +unitIdParam;
      const lessonOrder = +lessonOrderParam;
  
      console.log('unitId:', unitId);
      console.log('lessonOrder:', lessonOrder);
  
      const unit = this.wholeUnitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);
  
      console.log('unit:', unit);
  
      if (unit) {
        // Encontrar la unidad anterior con el número menor más cercano al orden de la unidad actual
        const previousUnit = this.wholeUnitsAndLessons
          .filter((prevUnit: { order: number; }) => +prevUnit.order < +unit.order)
          .sort((a: { order: number; }, b: { order: number; }) => +b.order - +a.order)[0];
  
        console.log('previousUnit:', previousUnit);
  
        if (previousUnit) {
          // Encontrar la lección con el menor orden dentro de la unidad anterior
          const previousLesson = previousUnit.lessons.reduce((prevLesson: { lesson_order: number; }, currLesson: { lesson_order: number; }) => {
            return (currLesson.lesson_order < prevLesson.lesson_order) ? currLesson : prevLesson;
          });
  
          console.log('previousLesson:', previousLesson);
  
          if (previousLesson) {
            this.videoUrl = ''; // Resetea la URL del video temporalmente
            setTimeout(() => {
              this.videoUrl = previousLesson.url; // Asigna la nueva URL del video después de un pequeño retraso
              console.log('videoUrl asignado:', this.videoUrl);
            });
  
            this.videoTrackingService.resetWatchedTime();
            console.log('Tiempo de visualización reseteado');
  
            this.router.navigate(['/view-lessons', previousUnit.id, previousLesson.lesson_order]);
            console.log('Navegando a la lección anterior:', previousUnit.id, previousLesson.lesson_order);
          } else {
            this.videoUrl = ''; // Si no hay lección anterior, resetea la URL del video
            console.log('No hay lección anterior, videoUrl reseteado');
          }
        } else {
          this.videoUrl = ''; // Si no se encuentra la unidad anterior, resetea la URL del video
          console.log('No se encuentra la unidad anterior, videoUrl reseteado');
        }
      } else {
        this.videoUrl = ''; // Si no se encuentra la unidad actual, resetea la URL del video
        console.log('Unidad no encontrada, videoUrl reseteado');
      }
    } else {
      this.videoUrl = ''; // Si no se encuentran los parámetros, resetea la URL del video
      console.log('Parámetros no encontrados, videoUrl reseteado');
    }
  }
  
  



}



