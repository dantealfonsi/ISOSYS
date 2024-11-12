import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component,ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { stringify } from 'node:querystring';
import Swal from 'sweetalert2';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-manage-exams',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatSelect,
    MatSlideToggleModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCheckboxModule,
    HttpClientModule
  ],
  templateUrl: './manage-exams.component.html',
  styleUrl: './manage-exams.component.css'
})
export class ManageExamsComponent {


  itemId!: string | null;
  examData: any;
  examDatafind: any;
  idQuestionActual: string = "1";
  questionData: any;
  fileList: any;

  AddExamFormGroup: any;
  AddAnswerFormGroup: any;
  showdialog: boolean = false;
  showeditdialog: boolean = false;
  showFilesdialog: boolean = false;

  dataSource: any;
  selectedFiles!: FileList;
  currentIndex: number=0;
  totalValueExam: number=0;
  maxValueQuestion: number=0;
  selectedQuestionList: any;
  isSelectDisabled: boolean = true;
  
  constructor(private cdr: ChangeDetectorRef,private _formBuilder: FormBuilder, private route: ActivatedRoute,private http: HttpClient,private router: Router) {}



  initializeFormGroups() {
    this.AddExamFormGroup = this._formBuilder.group({
      id:[''],
      exam_id: [this.itemId],
      question_order: ["", Validators.required],
      question_mark: ["", Validators.required],
      text: ["", Validators.required],
    });

    this.AddAnswerFormGroup = this._formBuilder.group({
      question_id: [""],
      exam_id: [""],
      type: ["", Validators.required],
      answer: ["", Validators.required],
      true_response: ["", Validators.required],
    });

  }

ngOnInit(): void {
  
  this.itemId = this.route.snapshot.paramMap.get('id');
  this.initializeFormGroups();
  this.loadList();  
}

/*isSelectDisabled(): boolean {
  return this.examDatafind && this.examDatafind.block_select > 0; 
}*/
async loadList() {
  try {
    this.examData = await this.this_exams_recover();

    // se incrementa el count
    this.currentIndex += this.convertToNumber(this.examData.count);

    // Verificar y convertir el total_score
    const totalScoreStr: string = this.examData?.data_exam?.total_score?.toString().trim() || "0";

    this.totalValueExam = Number(totalScoreStr);

    // Resto el valor total del examen al total de question que existen
    this.maxValueQuestion = this.totalValueExam - this.convertToNumber(this.examData.totalQuestionMark);

    const selectedQ = this.examData.question.find((p: { id: string; }) => p.id === this.idQuestionActual);
    this.examDatafind = selectedQ;

    // Traigo del back la información si se bloquea el select
    if (this.examDatafind && this.examDatafind.block_select > 0) {
      this.AddAnswerFormGroup.get('type').disable();
    }

    console.log(this.examDatafind);

  } catch (error) {
    console.error('Error al recuperar los datos de la lista:', error);
    // Maneja el error según tus necesidades
  }

  // this.dataSource = new MatTableDataSource(this.sectionList);
  // this.dataSource.paginator = this.paginator;
}


/************************START RECOVERS************************************/

async this_unit_recover() {
  try {
    const response = await fetch(
      "http://localhost/iso2sys_rest_api/server.php?this_unit_list=&id="+this.itemId,
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


async this_exams_recover() {
  try {
    const response = await fetch(
      "http://localhost/iso2sys_rest_api/server.php?this_exams_data=&id="+this.itemId,
    );
    if (!response.ok) {
      throw new Error("Error en la solicitud: " + response.status);
    }
    const data = await response.json();
    console.log("Datos examenes:", data);
    return data; // Devuelve los datos
  } catch (error) {
    console.error("Error en la solicitud:", error);
  }
}

async this_lessons_files_recover(id:string) {
  try {
    const response = await fetch(
      "http://localhost/iso2sys_rest_api/server.php?this_lessons_files=&id="+id,
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
/************************END RECOVERS************************************/

/*********************************START QUERYS*************************************** */

addQuestion() {
  const datos = {
    addQuestion: "",
    question: this.AddExamFormGroup.value
  };

  console.log('Datos que se enviarán:', datos);

  if (this.AddExamFormGroup.valid) {
    // El formulario tiene valores válidos
    // Aquí envia los datos al backend
    fetch('http://localhost/iso2sys_rest_api/server.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Respuesta del servidor:', data);
      Swal.fire({
        title: 'Lección añadida!',
        text: 'La Lección fue añadida con exito.',
        icon: 'success'
      });
      this.loadList();
      this.hideDialog();
    })
    .catch(error => {
      console.error('Error:', error);
    });

  } else {
    // El formulario no tiene valores válidos
    Swal.fire({
      title: '¡Faltan Datos en este formulario!',
      text: 'No puedes agregar debido a que no has ingesado todos los datos.',
      icon: 'error'
    });
  }
}


onEditList(id: string) {
  this.openEditDialog();
  const selectedId = id;

  if (Array.isArray(this.examData.question)) {  // Verificar que this.examData es un array
    const selectedQuestion = this.examData.question.find((p: { id: string; }) => p.id === selectedId);

    if (selectedQuestion) {
      this.AddExamFormGroup.patchValue({
        id: id,
        question_order: selectedQuestion.question_order,
        question_mark: selectedQuestion.question_mark,
        text: selectedQuestion.text
      });
    } else {
      console.error('Pregunta seleccionada no encontrada');
    }
  } else {
    console.error('this.examData no es un array');
  }
}

onFileList(id: string) {
    const selectedId = id;
    const selectedQuestion = this.examData.question.find((p: { id: string; }) => p.id === selectedId);
    this.examDatafind = selectedQuestion;
    this.idQuestionActual = selectedQuestion.id;

    this.selectedQuestionList =  this.examData.question.find((p: { id: string; }) => p.id === selectedId);

    if (selectedQuestion) {
      this.AddAnswerFormGroup.patchValue({
        question_id: selectedQuestion.id,
        exam_id: selectedQuestion.exam_id
      });

      console.log('examDataFind:', JSON.stringify(this.examDatafind, null, 2));

      //coloca enables el select
      this.AddAnswerFormGroup.get('type').enable();
      this.openFilesDialog();
    }

}

editLesson(){
  const datos = {
    editQuestion: "",
    question: this.AddExamFormGroup.value
  };

  if (this.AddExamFormGroup.valid) {
    // El formulario tiene valores válidos
    // Aquí envia los datos al backend
    fetch('http://localhost/iso2sys_rest_api/server.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
  
      console.log("error en edicion: "+data);
      Swal.fire({
        title: 'Sección Editada con Exito!',
        text: 'Esta sección ha sido editada con exito.',
        icon: 'success'
      });
      this.loadList();
      this.hideEditDialog()

    })
    .catch(error => {
      console.error('Error:', error);
    });

  } else {
    // El formulario no tiene valores válidos
    Swal.fire({
      title: '¡Faltan Datos en este formulario!',
      text: 'No puedes agregar debido a que no has ingesado todos los datos.',
      icon: 'error'
    });    
  }    
}



onFileSelected(event: any) {
  this.selectedFiles = event.target.files;
  this.onUpload()
}


onUpload() {
  const formData = new FormData();
  for (let i = 0; i < this.selectedFiles.length; i++) {
    formData.append('files[]', this.selectedFiles[i], this.selectedFiles[i].name);
    this.AddAnswerFormGroup.get('file').value.push(this.selectedFiles[i].name);
  }
  formData.append('addFile', 'true');
  formData.append('lesson_id', this.AddAnswerFormGroup.value.lesson_id);

  Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Quieres subir estos archivos?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, subir',
    cancelButtonText: 'No, cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.http.post('http://localhost/iso2sys_rest_api/server.php', formData).subscribe((response: any) => {
        console.log('Response:', response); // Para verificar la respuesta en la consola
        if (response.status === 'exists') {
          Swal.fire({
            title: '¡Advertencia!',
            text: `Ya existe un archivo con el nombre ${response.file} en esta lección. ${response.message}`,
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        } else if (response.status === 'success') {
          this.this_lessons_files_recover(this.AddAnswerFormGroup.value.lesson_id).then((files: any[]) => {
            this.fileList = files;
            Swal.fire(
              '¡Éxito!',
              'Los archivos se han subido correctamente.',
              'success'
            );
          }).catch(error => {
            console.error('Error recuperando los archivos de la lección:', error);
          });
        } else {
          console.error('Error del servidor:', response.message);
          Swal.fire(
            'Error',
            `Hubo un problema al subir los archivos: ${response.message}`,
            'error'
          );
        }
      });
    } else {
      Swal.fire(
        'Cancelado',
        'No se han subido los archivos.',
        'error'
      );
    }
  });
}

deleteAnswer(id: any) {
  const datos = {
    delete: id,
    tabla: "questions_data",
  };

  Swal.fire({
    title: "¿Estás seguro de Deshabilitarla?",
    text: "¡Esta Respuesta no seguirá apareciendo en la lista!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, Deshabilítala",
    cancelButtonText: "No, Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "¡Completado!",
        text: "La respuesta ha sido deshabilitada.",
        icon: "success"
      });
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
        this.loadList();
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  });
}

/**********************************END QUERYS*************************************** */

goBack(){
  this.router.navigate(['main/exam']);
}

firstLetterUpperCase(word: string): string {
  return word.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
} 

capitalizeWords(str : string) : string {
return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}


openDialog() {
  console.log('Se llamó a openDialog');
  console.log('Valor de maxValueQuestion:', this.maxValueQuestion);
  console.log('Estructura de AddExamFormGroup antes de patchValue:', this.AddExamFormGroup.value);
  if (this.maxValueQuestion > 0) {
    this.AddExamFormGroup.patchValue({
      question_order: +this.examData.count + 1,
    });
    console.log('Estructura de AddExamFormGroup después de patchValue:', this.AddExamFormGroup.value);
    this.showdialog = true;
    this.cdr.detectChanges();
    console.log('Valor de showdialog:', this.showdialog);


  } else {
    Swal.fire('Sin Cupo', 'Has alcanzado el máximo de preguntas según la ponderación del examen', 'error');
  }
}

openEditDialog() {
  this.showeditdialog = true;
}

openFilesDialog() {
  this.showFilesdialog = true;
}

hideFilesDialog() {
  this.showFilesdialog = false;
}

hideDialog() {
  this.showdialog = false;
  this.cdr.detectChanges();
}

hideEditDialog() {
  this.showeditdialog = false;
}
  
insertAnswerText() {
  //inserta en una pregunta si es autocomplete
  const datos = {
    addQuestionDataComplete: "",
    questionData: this.AddAnswerFormGroup.value
  };

  console.log(datos.questionData);

  if (this.AddAnswerFormGroup.valid) {
    // El formulario tiene valores válidos
    // Aquí envia los datos al backend
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
        title: 'Pregunta añadida!',
        text: 'La Pregunta fue añadida con exito.',
        icon: 'success'
      });
      this.loadList();
      this.hideFilesDialog();
    })
    .catch(error => {
      console.error('Error:', error);
    });

  } else {
    // El formulario no tiene valores válidos
    Swal.fire({
      title: '¡Faltan Datos en este formulario!',
      text: 'No puedes agregar debido a que no has ingesado todos los datos.',
      icon: 'error'
    });    
  }
}

insertAnswerRadius() {

  if (this.examDatafind.block_radius==='1' && this.AddAnswerFormGroup.get('true_response').value==='true') {
    Swal.fire({
      title: 'Respuesta Verdadera ya asignada!',
      text: 'En esta modalidad, solo puedes añadir una respuesta true.',
      icon: 'warning'
    });
  }else{
  //inserta en una pregunta si es autocomplete
  //getRawValue() este metodo te lee los controles desabilitados
  const datos = {
    addQuestionDataComplete: "",
    questionData: this.AddAnswerFormGroup.getRawValue()
  };

  console.log(datos.questionData);

  if (this.AddAnswerFormGroup.valid) {
    // El formulario tiene valores válidos
    // Aquí envia los datos al backend
    fetch('http://localhost/iso2sys_rest_api/server.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Verga",data);
      Swal.fire({
        title: 'Pregunta añadida!',
        text: 'La Pregunta fue añadida con exito.',
        icon: 'success'
      });      
      this.loadList();    
    })
    .catch(error => {
      console.error('Error:', error);
    });

  } else {
    // El formulario no tiene valores válidos
    Swal.fire({
      title: '¡Faltan Datos en este formulario!',
      text: 'No puedes agregar debido a que no has ingesado todos los datos.',
      icon: 'error'
    });    
  }
}
}





customValidators(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const type = group.get('type')?.value;
    const simpleAnswer = group.get('simple_answer')?.value;
    const completeAnswer = group.get('complete_answer')?.value;

    let errors: ValidationErrors = {};

    if (type === 'simple' && !simpleAnswer) {
      errors['simpleAnswerRequired'] = 'Simple answer is required when type is simple';
    } else if (type === 'complete' && !completeAnswer) {
      errors['completeAnswerRequired'] = 'Complete answer is required when type is complete';
    } else if (type === 'multiple' && (simpleAnswer || completeAnswer)) {
      errors['noAnswersForMultiple'] = 'No answers should be provided when type is multiple';
    }

    return Object.keys(errors).length ? errors : null;
  };
}


 convertToNumber(value: any): number {
  if (typeof value === 'string') {
    const num = Number(value.trim());
    if (isNaN(num)) {
      console.error(`Error: No se pudo convertir "${value}" a número.`);
      return 0; // O cualquier valor predeterminado adecuado
    }
    return num;
  } else if (typeof value === 'number') {
    return value; // Si ya es un número, simplemente devuélvelo
  } else {
    console.error(`Error: El valor no es una cadena ni un número. Valor:`, value);
    return 0; // O cualquier valor predeterminado adecuado
  }
}





///////////////AJUSTAR BACKGROUND///////////////////////////////


}
