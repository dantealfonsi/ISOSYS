import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { MatIconModule } from '@angular/material/icon';
import { UserNavbarComponent } from '../../assets/user-navbar/user-navbar.component';
import { FooterComponent } from '../../assets/footer/footer.component';
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import { ReactiveFormsModule } from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule,YouTubePlayerModule,MatIconModule,UserNavbarComponent, FooterComponent,MatStepperModule,MatRadioModule,ReactiveFormsModule,MatCheckboxModule],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.css'
})
export class ExamComponent {


  unitsAndLessons: any[] = []; 
  itemId!: string | null; 
  lesson_order!: string | null; 
  lesson: any; 
  url: string | undefined;

  exam_id!: string | null;
  @Input() exam: any; 
  questions?: any[];
  stepCtrl!: FormGroup[];


////////////////VALIDADORES DE EXAMENES///////////////
selectedRadio!: string;




  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public router: Router,
    private fb: FormBuilder
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



  async this_specific_exam_recover() {

    try {
        const response = await fetch(
            `http://localhost/iso2sys_rest_api/server.php?this_exams_data=&id=${this.exam_id}`
        );
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.status);
        }
        const data = await response.json();
        console.log('Datos recibidos:', data);
      
        return data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
}






filterUnitsAndLessons(unitsAndLessons: any[], itemId: any) { return unitsAndLessons.filter(unit => unit.id === itemId);}
  

async ngOnInit() {
  this.itemId = this.route.snapshot.paramMap.get('id');
  this.exam_id = this.route.snapshot.paramMap.get('exam_id');

  this.unitsAndLessonsListRecover()
    .then(data => { 
      this.unitsAndLessons = this.filterUnitsAndLessons(data, this.itemId); 
      console.log("Unidades y lecciones filtradas:", this.unitsAndLessons); 
    })
    .catch(error => { 
      console.error('Error recuperando las unidades y lecciones:', error); 
    });

  // Aseguramos que lesson no es undefined antes de acceder a url

    this.exam = await this.this_specific_exam_recover();
    console.log("Datos de los Examenes:", this.exam); 

    if (this.exam) {
      this.initializeExam();
    }
}



initializeExam() {
  this.questions = Array.isArray(this.exam.question) ? this.exam.question : [];
  this.stepCtrl = this.questions!.map(() => this.fb.group({}));
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

  hasRadiusOptions: boolean[] = [];

  checkRadioOptions() {
    this.questions?.forEach((question, index) => {
      this.hasRadiusOptions[index] = question.question_data.some((answer: { type: string; }) => answer.type === 'radius');
    });
  }


  
}

