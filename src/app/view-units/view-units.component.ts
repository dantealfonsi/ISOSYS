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
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule, provideNativeDateAdapter} from '@angular/material/core';
import {MatRadioModule} from '@angular/material/radio';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import { Router } from "@angular/router";
import { UserNavbarComponent } from "../../assets/user-navbar/user-navbar.component";
import { FooterComponent } from "../../assets/footer/footer.component";

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
    MatNativeDateModule ,
    MatRadioModule,
    MatMenuModule,
    MatListModule,
    MatButtonModule
  ],
  templateUrl: './view-units.component.html',
  styleUrl: './view-units.component.css'
})
export class ViewUnitsComponent {

  constructor(private router: Router) {}
  
  goToLesson(unitId: string, lessonOrder: string): void {
    this.router.navigate(['/view-lessons', unitId, lessonOrder]);
  }

  goToExam(unitId: string, examId: string): void {
    this.router.navigate(['/view-exam', unitId, examId]);
  }

  unitsAndLessons!: any[];

  ngOnInit(): void {
    this.unitsAndLessonsListRecover().then(data => {
      this.unitsAndLessons = data;
    }).catch(error => {
      console.error('Error recuperando las unidades y lecciones:', error);
    });
  }


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



}
