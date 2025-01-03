import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, viewChild, ElementRef } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatListModule } from "@angular/material/list";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import Swal from "sweetalert2";
import { Subject } from "rxjs";
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import { Router } from "@angular/router";
import { UserNavbarComponent } from "../../assets/user-navbar/user-navbar.component";
import { FooterComponent } from "../../assets/footer/footer.component";
import { VideoTrackingService } from '../video-tracking.service';
import { AuthService } from "../../auth.service";

@Component({
  selector: 'app-view-units',
  standalone: true,
  imports: [
    UserNavbarComponent,
    FooterComponent,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatListModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatMenuModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './view-units.component.html',
  styleUrl: './view-units.component.css'
})
export class ViewUnitsComponent {

  ////////////////////////////COMMON VARIABLES///////////////////////////////////////

  progressPercentage: number = 0;
  viewedVideos: any = [];
  unitsAndLessons!: any[];

  ////////////////////////////END COMMON VARIABLES///////////////////////////////////////

  constructor(private router: Router, public videoTrackingService: VideoTrackingService, private authService: AuthService) { }

  ngOnInit(): void {
    this.viewedVideos = []; // Inicializa como un array vacío

    const token = this.authService.getToken('token');
    const obj = JSON.parse(token);

    this.unitsAndLessonsListRecover().then(data => {
      this.unitsAndLessons = data;
    }).catch(error => {
      console.error('Error recuperando las unidades y lecciones:', error);
    });

    if (token) {
      this.loadViewedVideos(obj.id);
    }
  }

  ////////////////////////////QUERY CONTROLLERS///////////////////////////////////////

  async loadViewedVideos(userId: number) {
    try {
      const data = await this.viewVideosRecover(userId);
      if (Array.isArray(data)) {
        this.viewedVideos = data;
      } else {
        console.error("Los datos recibidos no son un array", data);
      }
      console.log("viewedVideos:", this.viewedVideos);
    } catch (error) {
      console.error("Error al recuperar los videos vistos:", error);
    }
  }

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

  async viewVideosRecover(id: number) {
    try {
      const response = await fetch(
        "http://localhost/iso2sys_rest_api/server.php?view_videos&user_id=" + id
      );
      if (!response.ok) {
        throw new Error("Error en la solicitud: " + response.status);
      }
      let data = await response.json();
      console.log("Datos recibidos:", data);

      // Asegúrate de que data sea siempre un array
      if (!Array.isArray(data)) {
        // Si es un objeto, conviértelo en un array
        data = [data];
      }

      return data;
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }

  ////////////////////////////END QUERY CONTROLLERS///////////////////////////////////////


  ////////////////////////////ROUTE CONTROLLERS///////////////////////////////////////

  goToLesson(unitId: string, lessonOrder: string): void {
    this.router.navigate(['/view-lessons', unitId, lessonOrder]);
  }

  goToExam(unitId: string, examId: string): void {
    this.router.navigate(['/view-exam', unitId, examId]);
  }

  ////////////////////////////END ROUTE CONTROLLERS///////////////////////////////////////

  ////////////////////////////PROGRESS CONTROLLERS///////////////////////////////////////

  loadProgress(): void {
    const key = this.videoTrackingService.getLocalStorageKey();
    const savedProgress = localStorage.getItem(key);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      this.progressPercentage = parseFloat(progress.progressPercentage);
    } else {
      this.progressPercentage = 0; // Valor predeterminado
    }
  }

  getDivWidth(lessonId: number): string {
    const token = this.authService.getToken('token');
    if (token) {
      const obj = JSON.parse(token);
      if (obj && obj.id) {
        const key = `${obj.id}_${lessonId}_lesson_videos`;
        const savedProgress = localStorage.getItem(key);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          const progressPercentage = parseFloat(progress.progressPercentage);
          if (progressPercentage > 50) {
            return '1rem';
          } else if (progressPercentage > 25) {
            return '0.5rem';
          }
        }
      } else {
        console.error("ID no encontrado en el token", obj);
      }
    } else {
      //console.error("Token no encontrado");
    }
    return '0'; // Valor predeterminado si el progreso es menor al 25% o no hay progreso guardado
  }


  getDivDisplay(lessonId: number): string {
    const token = this.authService.getToken('token');
    if (token) {
      const obj = JSON.parse(token);
      if (obj && obj.id) {
        const key = `${obj.id}_${lessonId}_lesson_videos`;
        const savedProgress = localStorage.getItem(key);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          const progressPercentage = parseFloat(progress.progressPercentage);
          if (progressPercentage < 25) {
            return 'none';
          } else {
            return 'block'; // Mostrar el div si el progreso es mayor o igual al 25%
          }
        } else {
          return 'none'; // No hay progreso guardado
        }
      } else {
        //console.error("ID no encontrado en el token", obj);
      }
    } else {
      //console.error("Token no encontrado");
    }
    return 'none'; // Mostrar 'none' por defecto si no se encuentra el token o el ID
  }

  isLessonViewed(lessonId: number): boolean {
    if (Array.isArray(this.viewedVideos)) {
      return this.viewedVideos.some(video => video.lesson_id === lessonId);
    }
    console.error("viewedVideos no es un array", this.viewedVideos);
    return false;
  }

  ////////////////////////////END PROGRESS CONTROLLERS///////////////////////////////////////



}






