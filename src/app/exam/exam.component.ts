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
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import { ReactiveFormsModule } from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import Swal from 'sweetalert2';

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
  stepCtrl: FormGroup[]; 
  selectedType: string | null = null;

////////////////VALIDADORES DE EXAMENES///////////////
selectedRadio!: string;


selectedAnswers: { [step: number]: { [questionId: string]: any } } = {};
correctAnswers: { [key: string]: string } = {};
checkboxCounts: { [step: number]: { positives: number; negatives: number } } = {};

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public router: Router,
    private fb: FormBuilder,
    private _formBuilder: FormBuilder
  ) { 
    this.questions = this.questions || [];
    this.stepCtrl = this.questions.map(() => this._formBuilder.group({}));
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


  async this_specific_exam_recover() {

    try {
        const response = await fetch(
            `http://localhost/iso2sys_rest_api/server.php?evaluation_exams_data=&id=${this.exam_id}`
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

  try {
    this.unitsAndLessons = this.filterUnitsAndLessons(await this.unitsAndLessonsListRecover(), this.itemId);
    console.log("Unidades y lecciones filtradas:", this.unitsAndLessons);

    this.exam = await this.this_specific_exam_recover();
    console.log("Datos de los Examenes:", this.exam);

    if (this.exam) {
      this.initializeExam();
    }
  } catch (error) {
    console.error('Error recuperando las unidades y lecciones:', error);
  }

  // Asegúrate de que questions no es undefined
  if (this.questions) {
    this.stepCtrl = this.questions.map(() => this._formBuilder.group({selectedAnswer: ['', Validators.required]}));
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


  onSelectionChange(answer: any, step: number, type: string, checkbox_true: string, questionId: string, true_response: boolean, isChecked?: boolean): void {
    if (!this.selectedAnswers[step]) {
      this.selectedAnswers[step] = {}; // Inicializa el objeto de respuestas seleccionadas para el paso si no existe
    }
  
    if (type === 'checkbox' && isChecked !== undefined) {
      // Si es un checkbox, actualiza la respuesta seleccionada
      if (!this.selectedAnswers[step][questionId]) {
        this.selectedAnswers[step][questionId] = [];
      }
  
      const existingIndex = this.selectedAnswers[step][questionId].findIndex((ans: any) => ans.answerId === answer.id);
      if (isChecked && existingIndex === -1) {
        // Si está checkeado y no está en la lista, agrégalo
        this.selectedAnswers[step][questionId].push({
          answerId: answer.id,
          isChecked: isChecked,
          true_response: true_response,
          type: type,
          checkbox_true: checkbox_true
        });
      } else if (!isChecked && existingIndex !== -1) {
        // Si no está checkeado y está en la lista, elimínalo
        this.selectedAnswers[step][questionId].splice(existingIndex, 1);
      }
    } else {
      // Si no es checkbox, actualiza la respuesta directamente
      this.selectedAnswers[step][questionId] = {
        ...answer,
        type: type,
        checkbox_true: checkbox_true,
        true_response: true_response
      };
    }
  
    console.log('Selected Step Answers => ', this.selectedAnswers);
    //console.log(`Step: ${step}, Selected type: ${type}, Question ID: ${questionId}, Is Correct: ${answer.true_response === 'true'}, Is Checked: ${isChecked}`);
  }
  

// Método para capturar el valor del input
onTextInput(event: any, step: number, questionId: string, answer: any): void {
  const inputValue = event.target.value;
  if (!this.selectedAnswers[step]) {
    this.selectedAnswers[step] = {};
  }
  this.selectedAnswers[step][questionId] = { ...answer, user_response: inputValue, type: 'text' };
  console.log(`Input for question ${questionId}: ${inputValue}`);
  console.log(`Selected Answers:`, this.selectedAnswers);
}

onRadioChange(event: any, step: number, question: any): void {
  const selectedAnswer = question.question_data.find((answer: any) => answer.id === event.value);
  if (selectedAnswer) {
    this.onSelectionChange(selectedAnswer,step, selectedAnswer.type, selectedAnswer.checkbox_true, question.id, selectedAnswer.true_response);
  }

}

/*
checkAllAnswersTrue(step: number): boolean {
  const selectedStepAnswers = this.selectedAnswers[step] || {};
  console.log('Selected Step Answers:', selectedStepAnswers);

  // Inicializar contadores
  let trueCount = 0;
  let falseCount = 0;
  const checkboxTrueCount = this.questions[step].checkbox_true;
  
  // Recorrer todas las respuestas seleccionadas
  for (const [questionId, answer] of Object.entries(selectedStepAnswers)) {
    console.log('Processing aqui:', answer.checkbox_true);

    if (answer.type === 'checkbox' && answer.isChecked) {
      console.log('es un checkbox');
      // Contar respuestas verdaderas y falsas de los checkboxes
      if (answer.true_response === 'true') {
        trueCount++;
        console.log(trueCount);
      } else if (answer.true_response === 'false') {
        falseCount++;
        console.log(falseCount);

      }
    } else if (answer.type === 'radius') {
      console.log('es un radius');
      // Contar respuesta del radio button
      if (answer.true_response === 'true') {
        trueCount++;
      } else if (answer.true_response === 'false') {
        falseCount++;
      }
    } else if (answer.type === 'text') {
      console.log('es un text');
      // Contar respuesta de tipo texto
      console.log(`text: ${answer.user_response}, text compare: ${answer.true_response}`);
      if (answer.user_response === answer.true_response) {
        console.log("aprobado......");
        trueCount++;
      } else {
        falseCount++;
      }
    }
  }

  // Validar que haya más respuestas verdaderas que falsas seleccionadas
  const checkboxesValid = trueCount > falseCount;

  console.log(`True Count: ${trueCount}, False Count: ${falseCount}`);

  // Actualizar la verificación de todas las respuestas
  const allCorrect = Object.values(selectedStepAnswers).every((answer: any) => {
    if (answer.type === 'checkbox') {
      return answer.isChecked ? answer.true_response === 'true' : true;
    }
    if (answer.type === 'radius') {
      return answer.true_response === 'true';
    }
    if (answer.type === 'text') {
      return answer.user_response === answer.true_response;
    }
    return true;
  });

  console.log(`allCorrect: ${allCorrect}, checkboxesValid: ${checkboxesValid}`);

  return allCorrect && checkboxesValid;
}

*/

checkboxAllAnswers(step: number): boolean {
  const selectedStepAnswers = this.selectedAnswers[step] || {};
  console.log('Selected Step Answers:', selectedStepAnswers);

  // Inicializar el contador de respuestas verdaderas
  let trueCount = 0;

  // Obtener el número de respuestas verdaderas requeridas del backend
  let checkboxTrueCount = '0';
  console.log('checkbox_true:', checkboxTrueCount);

  // Recorrer todas las respuestas seleccionadas
  for (const answers of Object.values(selectedStepAnswers)) {
    if (Array.isArray(answers)) {
      for (const answer of answers) {
        checkboxTrueCount = answer.checkbox_true;
        if (answer.type === 'checkbox' && answer.isChecked) {
          // Contar respuestas verdaderas de los checkboxes
          if (answer.true_response === 'true') {
            trueCount++;
            console.log('trueCount:', trueCount);
          } else {
            // Si alguna respuesta falsa está seleccionada, la pregunta es incorrecta
            console.log('Una respuesta falsa está seleccionada');
            return false;
          }
        }
      }
    }
  }

  // Verificar si el número de respuestas verdaderas seleccionadas coincide con checkbox_true
  const isCorrect = trueCount === parseInt(checkboxTrueCount, 10);
  console.log(`¿Número de respuestas verdaderas seleccionadas es correcto?: ${isCorrect}`);

  return isCorrect;
}



checkAllAnswersTrue(step: number): boolean {
  const selectedStepAnswers = this.selectedAnswers[step] || {};

  // Inicializar contadores
  let trueCount = 0;
  let falseCount = 0;
  let checkboxTrueCount = '0';
  let checkbox_active = false;
  
  // Recorrer todas las respuestas seleccionadas
  for (const answers of Object.values(selectedStepAnswers)) {
    if (Array.isArray(answers)) {
      for (const answer of answers) {
        checkboxTrueCount = answer.checkbox_true;
        if (answer.type === 'checkbox' && answer.isChecked) {
          checkbox_active = true;
          // Contar respuestas verdaderas de los checkboxes
          if (answer.true_response === 'true') {
            trueCount++;
            console.log('trueCount:', trueCount);
          } else {
            // Si alguna respuesta falsa está seleccionada, la pregunta es incorrecta
            return false;
          }
        }
      }
    }else{
      if (answers.type === 'radius') {
        console.log('es un radius');
        // Contar respuesta del radio button
        if (answers.true_response === 'true') {
          trueCount++;
        } else if (answers.true_response === 'false') {
          falseCount++;
        }
      } else if (answers.type === 'text') {
        console.log('es un text');
        // Contar respuesta de tipo texto
        console.log(`text: ${answers.user_response}, text compare: ${answers.true_response}`);
        if (answers.user_response === answers.true_response) {
          console.log("aprobado......");
          trueCount++;
        } else {
          falseCount++;
        }
      }
    } 
  }

  // Actualizar la verificación de todas las respuestas
  
  const allCorrect = Object.values(selectedStepAnswers).every((answer: any) => {
    if (checkbox_active) {
    const isCorrect = trueCount === parseInt(checkboxTrueCount, 10);
     console.log('isCorrect -->',isCorrect);
      return isCorrect;
    }
    if (answer.type === 'radius') {
      return answer.true_response === 'true';
    }
    if (answer.type === 'text') {
      return answer.user_response === answer.true_response;
    }
    return true;
  });

  console.log('allCorrect -->',allCorrect);
  return allCorrect;  
  //return this.checkboxAllAnswers(step);
}

  colorChange: boolean = false;
  firstAttempt: boolean = true;
  userMark: number = 0;

  isLastStep(index: number): boolean { return index === this.questions!.length - 1; }

  isStepValid(index: number): boolean { const formGroup = this.stepCtrl[index]; return formGroup.valid; }

  validateAndProceed(event: Event, index: number, stepper: MatStepper): void {
    event.preventDefault();
  
    const confirmResponse = () => {
      Swal.fire({
        title: '¿Tu respuesta es definitiva?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          // Activa el cambio de color después de la confirmación
          this.colorChange = true;
  
          const allAnswersTrue = this.checkAllAnswersTrue(index);
          if (allAnswersTrue) {
            Swal.fire('¡Correcto!', 'Todas las respuestas son correctas.', 'success');
          } else {
            Swal.fire('¡Error!', 'Hay respuestas incorrectas.', 'error');
          }
          this.stepCtrl[index].markAsTouched();
          this.firstAttempt = false;  // Marca que la primera vez ya ha pasado
        }
      });
    };
  
    if (this.firstAttempt) {
      confirmResponse();
    } else {
      const allAnswersTrue = this.checkAllAnswersTrue(index);
      if (allAnswersTrue) {
        const hiddenInput = document.getElementById(`hidden-mark-${index}`) as HTMLInputElement; 
        this.userMark += Number(hiddenInput.value);
        console.log(this.userMark);
        Swal.fire('¡Correcto!', 'Todas las respuestas son correctas.', 'success').then(() => {
          stepper.next();
          // Restablece el fondo a blanco y desactiva el cambio de color después de avanzar
          setTimeout(() => {
            this.colorChange = false;
            this.firstAttempt = true;  // Restablece para el siguiente step
          }, 100);
        });
      } else {
        Swal.fire({
          title: '¡Error!',
          text: 'Hay respuestas incorrectas.',
          icon: 'error',
          confirmButtonText: 'Continuar'
        }).then(() => {
          stepper.next();
          // Restablece el fondo a blanco y desactiva el cambio de color después de avanzar
          setTimeout(() => {
            this.colorChange = false;
            this.firstAttempt = true;  // Restablece para el siguiente step
          }, 100);
        });
      }
      this.stepCtrl[index].markAsTouched();
    }
  }

  preventNavigation(event: MouseEvent): void {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
  


  // El resto del código del componente...


  
  
  

  
}




