import { Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { ExamCompletionDialogComponent } from '../exam-completion-dialog/exam-completion-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VideoTrackingService } from '../video-tracking.service';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule,MatTabsModule, YouTubePlayerModule,MatTooltipModule,MatIconModule,UserNavbarComponent, FooterComponent,MatStepperModule,MatRadioModule,ReactiveFormsModule,MatCheckboxModule],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.css'
})
export class ExamComponent {


  unitsAndLessons: any[] = []; 
  wholeUnitsAndLessons: any[] = [];

  itemId!: string | null; 
  lesson_order!: string | null; 
  lesson: any; 
  
  url: string | undefined;

  videoUrl: string = '';

  isFirstExam: boolean = false;
  isLastExam: boolean = false;
  isFirstUnit: boolean = false;
  isLastUnit: boolean = false;
  currentLessonOrder!: number;


  exam_id!: string | null;
  @Input() exam: any; 
  questions?: any[];
  stepCtrl: FormGroup[];


  ////AÑADIR NOTAS///////
  addMarkFormGroup!: FormGroup; 
  userId: any = JSON.parse(localStorage.getItem('token') || '{}')?.id;

  /////FIN AÑADIR NOTAS//////
  selectedType: string | null = null;

////////////////VALIDADORES DE EXAMENES///////////////
selectedRadio!: string;


selectedAnswers: { [step: number]: { [questionId: string]: any } } = {};
correctAnswers: { [key: string]: string } = {};
checkboxCounts: { [step: number]: { positives: number; negatives: number } } = {};


  @ViewChild('examDialog', { static: false }) examDialog: ElementRef | undefined;

  
  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public router: Router,
    private fb: FormBuilder,
    private _formBuilder: FormBuilder,
    public examResults: MatDialog,
    public videoTrackingService: VideoTrackingService
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

  this.route.params.subscribe(async params => {
  this.itemId = this.route.snapshot.paramMap.get('id');
  this.exam_id = this.route.snapshot.paramMap.get('exam_id');
  console.log(this.userId);
  try {
    this.unitsAndLessons = this.filterUnitsAndLessons(await this.unitsAndLessonsListRecover(), this.itemId);
    this.wholeUnitsAndLessons = await this.unitsAndLessonsListRecover();

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
});
}


ngAfterViewInit(): void {

  if (window.innerWidth <= 950) {
    this.examDialog!.nativeElement.style.height = `${this.examDialog!.nativeElement.offsetWidth * 3 / 4}px`; // Relación de aspecto 4:3      
  } else {
    this.examDialog!.nativeElement.style.height = `${this.examDialog!.nativeElement.offsetWidth * 9 / 24}px`; // Relación de aspecto 16:9     
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
  
      if (this.isLastStep(index)) {
        this.addMark().then(() => {
          this.openExamResults(this.userMark);
        }).catch(error => {
          console.error('Error al añadir la puntuación:', error);
        });
      }
  
      this.stepCtrl[index].markAsTouched();
    }
  }


  preventNavigation(event: MouseEvent): void {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
  


  openExamResults(userMark: number): void { 
    const dialogRef = this.examResults.open(ExamCompletionDialogComponent, 
      { width: '100%', 
        data: { userMark: userMark } 
      }); dialogRef.afterClosed().subscribe(
        result => { console.log('El diálogo se cerró'); }
          // Realiza alguna acción después de cerrar el diálogo si es necesario }); }
        )
      }




        addMark(): Promise<void> {
          return new Promise((resolve, reject) => {
            const datos = {
              addMark: "",
              score: this.userMark,
              exam_id: this.exam_id,
              user_id: this.userId
            };
        
            console.log(datos);
            fetch('http://localhost/iso2sys_rest_api/server.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(datos)
            })
            .then(response => response.json())
            .then(data => {
              console.log(data);
              Swal.fire({
                title: 'Puntuación añadida!',
                text: 'La puntuación fue añadida con éxito.',
                icon: 'success'
              }).then(() => {
                resolve();  // Resuelve la promesa cuando los datos se envían con éxito
              });
            })
            .catch(error => {
              console.error('Error:', error);
              reject(error);  // Rechaza la promesa si hay un error
            });
          });
        }
        

        goToExam(unitId: string, lesson_id: string, exam_order: number): void {
          this.router.navigate(['/view-exam', unitId, lesson_id, exam_order]);
        }

        goBack(){
          this.router.navigate(['/view-units']);
        }


        goToNextExam() {
          const unitIdParam = this.route.snapshot.paramMap.get('id');
          const examOrderParam = this.route.snapshot.paramMap.get('exam_order');
        
          console.log('unitIdParam:', unitIdParam);
          console.log('examOrderParam:', examOrderParam);
        
          if (unitIdParam && examOrderParam) {
            const unitId = +unitIdParam;
            const examOrder = +examOrderParam;
        
            console.log('unitId:', unitId);
            console.log('examOrder:', examOrder);
        
            const unit = this.unitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);
        
            console.log('unit:', unit);
        
            if (unit) {
              // Encontrar los exámenes con un orden mayor
              const nextExams = unit.exams.filter((exam: { exam_order: number; }) => exam.exam_order > examOrder);
              
              console.log('nextExams:', nextExams);
        
              if (nextExams.length > 0) {
                // Tomar el primer examen con orden mayor
                const nextExam = nextExams[0];
        
                this.router.navigate(['/view-exam', unitId, nextExam.id, nextExam.exam_order]);
                console.log('Navegando al siguiente examen:', unitId, nextExam.id, nextExam.exam_order);
              } else {
                this.videoUrl = ''; // Si no hay exámenes siguientes, resetea la URL del video
                console.log('No hay siguientes exámenes, videoUrl reseteado');
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
        
        
        
        goToPreviousExam() {
          const unitIdParam = this.route.snapshot.paramMap.get('id');
          const examOrderParam = this.route.snapshot.paramMap.get('exam_order');
        
          console.log('unitIdParam:', unitIdParam);
          console.log('examOrderParam:', examOrderParam);
        
          if (unitIdParam && examOrderParam) {
            const unitId = +unitIdParam;
            const examOrder = +examOrderParam;
        
            console.log('unitId:', unitId);
            console.log('examOrder:', examOrder);
        
            const unit = this.unitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);
        
            console.log('unit:', unit);
        
            if (unit) {
              // Encontrar los exámenes con un orden menor
              const previousExams = unit.exams.filter((exam: { exam_order: number; }) => exam.exam_order < examOrder).reverse();
              
              console.log('previousExams:', previousExams);
        
              if (previousExams.length > 0) {
                // Tomar el primer examen con orden menor
                const previousExam = previousExams[0];
        
                this.router.navigate(['/view-exam', unitId, previousExam.id, previousExam.exam_order]);
                console.log('Navegando al examen anterior:', unitId, previousExam.id, previousExam.exam_order);
              } else {
                this.videoUrl = ''; // Si no hay exámenes anteriores, resetea la URL del video
                console.log('No hay exámenes anteriores, videoUrl reseteado');
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
        
        
        
        
          checkForNoPreviousExam() {
            const unitIdParam = this.route.snapshot.paramMap.get('id');
            const examOrderParam = this.route.snapshot.paramMap.get('exam_order');
        
            if (unitIdParam && examOrderParam) {
              const unitId = +unitIdParam;
              const examOrder = +examOrderParam;
              const unit = this.unitsAndLessons.find((unit: { id: string; }) => +unit.id === unitId);
              if (unit) {
                const previousLesson = unit.lessons.slice().reverse().find((
                  exam: { exam_order: number; }) => exam.exam_order < examOrder);
                if (!previousLesson) {
                  this.isFirstExam = true;
                } else{
                  this.isFirstExam = false;
                }
              } else {
                console.log('Unidad no encontrada, videoUrl reseteado');
                this.isFirstExam = false;
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
                  this.isLastExam = true;
                } else {
                  this.isLastExam = false;
                }
              } else {
                console.log('FALSO');
                this.isLastExam = false;
              }
            } else {
              console.log('FALSO');
              this.isLastExam = false;
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
  // El resto del código del componente...

  





