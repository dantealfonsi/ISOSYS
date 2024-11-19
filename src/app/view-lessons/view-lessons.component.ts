import { Component, OnInit } from '@angular/core';
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
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-view-lessons',
  standalone: true,
  imports: [CommonModule,YouTubePlayerModule,MatTooltipModule,MatIconModule,UserNavbarComponent, FooterComponent,VgOverlayPlayModule,VgBufferingModule,VgCoreModule, VgControlsModule],
  templateUrl: './view-lessons.component.html',
  styleUrl: './view-lessons.component.css'
})

export class ViewLessonsComponent implements OnInit {

  unitsAndLessons: any[] = []; 
  itemId!: string | null; 
  lesson_order!: string | null; 
  lesson: any; 
  url: string | undefined;

  videoUrl: string = 'http://localhost/iso2sys_rest_api/videos/prueba.mp4';


  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public router: Router
  ) {}


  async unitsAndLessonsListRecover(){
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

  

filterUnitsAndLessons(unitsAndLessons: any[], itemId: any) { return unitsAndLessons.filter(unit => unit.id === itemId);}
  

 ngOnInit() {
  this.route.params.subscribe(params => {
    this.itemId = this.route.snapshot.paramMap.get('id');
    this.lesson_order = this.route.snapshot.paramMap.get('lesson_order');
  this.loadLesson();
  });
}

  async loadLesson(){

    this.lesson = await this.this_specific_lesson_recover();
  
    this.unitsAndLessonsListRecover()
      .then(data => { 
        this.unitsAndLessons = this.filterUnitsAndLessons(data, this.itemId); 
        console.log("Unidades y lecciones filtradas:", this.unitsAndLessons); 
  
        // Aseguramos que unitsAndLessons y sus propiedades están definidos
        if (this.unitsAndLessons.length > 0 && this.unitsAndLessons[0].lessons.length > 0) {
          this.url = this.unitsAndLessons[0].lessons[0].url;
        }
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


  goToLesson(unitId: string, lessonOrder: string): void {
    this.router.navigate(['/view-lessons', unitId, lessonOrder]);
  }

  goToExam(unitId: string, lesson_id: string): void {
    this.router.navigate(['/view-exam', unitId, lesson_id]);
  }

  goBack(){
    this.router.navigate(['/view-units']);
  }


  isMp4(url: string): boolean { return url.includes('.mp4'); }

}  





