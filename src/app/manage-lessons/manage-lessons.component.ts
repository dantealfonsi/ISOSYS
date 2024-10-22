import { Component, ViewChild, OnInit, ElementRef} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
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
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http'; // Importa HttpClientModule

@Component({
  selector: 'app-manage-lessons',
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
    HttpClientModule
  ],
  templateUrl: './manage-lessons.component.html',
  styleUrl: './manage-lessons.component.css'
})
export class ManageLessonsComponent {
  itemId!: string | null;
  unitData: any;
  lessonData: any;
  fileList: any;

  AddLessonFormGroup: any;
  AddFilesFormGroup: any;
  showdialog: boolean = false;
  showeditdialog: boolean = false;
  showFilesdialog: boolean = false;

  dataSource: any;
  selectedFiles!: FileList;

  constructor(private _formBuilder: FormBuilder, private route: ActivatedRoute,private http: HttpClient) {}



  initializeFormGroups() {
    this.AddLessonFormGroup = this._formBuilder.group({
      id: [''],
      unitId: [this.itemId = this.route.snapshot.paramMap.get('id')],
      title: ["", Validators.required],
      content: [''],
      lesson_order: ["",Validators.required],
      summary: ["",Validators.required],
      url: ["",Validators.required],
    });

    this.AddFilesFormGroup = this._formBuilder.group({
      lesson_id: [""],
      file: this._formBuilder.array([], Validators.required)
    });

  }

ngOnInit(): void {
  
  this.itemId = this.route.snapshot.paramMap.get('id');
  this.initializeFormGroups();
  this.loadList();
  
}


async loadList() {
  try {
      this.unitData = await this.this_unit_recover();
      this.lessonData = await this.this_lessons_recover();
  
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


async this_lessons_recover() {
  try {
    const response = await fetch(
      "http://localhost/iso2sys_rest_api/server.php?this_lessons_list=&id="+this.itemId,
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


addLesson() {

  const datos = {
    addLesson: "",
    lesson: this.AddLessonFormGroup.value
  };

  console.log(datos.lesson);

  if (this.AddLessonFormGroup.valid) {
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
        title: 'Seccion añadida!',
        text: 'La sección fue añadida con exito.',
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
  const selectedLesson = this.lessonData.find((p: { id: string; }) => p.id === selectedId);
  if (selectedLesson) {
    this.AddLessonFormGroup.patchValue({
      id: id,
      title: selectedLesson.title,
      content: selectedLesson.content,
      lesson_order: selectedLesson.lesson_order,
      summary: selectedLesson.summary,
      url: selectedLesson.url 
    });
  }
}  


onFileList(id: string) {
  this.this_lessons_files_recover(id).then((files: any[]) => {
    this.fileList = files;
    this.openFilesDialog();
    const selectedId = id;
    const selectedLesson = this.lessonData.find((p: { id: string; }) => p.id === selectedId);
    if (selectedLesson) {
      this.AddFilesFormGroup.patchValue({
        lesson_id: id,
      });
    }
  }).catch(error => {
    console.error('Error recuperando los archivos de la lección:', error);
  });
}

editLesson(){
  const datos = {
    editLesson: "",
    lesson: this.AddLessonFormGroup.value
  };

  if (this.AddLessonFormGroup.valid) {
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
}

onUpload() {
  const formData = new FormData();
  for (let i = 0; i < this.selectedFiles.length; i++) {
    formData.append('files[]', this.selectedFiles[i], this.selectedFiles[i].name);
    this.AddFilesFormGroup.get('file').value.push(this.selectedFiles[i].name);
  }
  formData.append('addFile', 'true'); // Añade este campo
  formData.append('lesson_id', this.AddFilesFormGroup.value.lesson_id); // Añade este campo

  console.log('epale mano' + this.AddFilesFormGroup.value.lesson_id); // Verifica los valores en el FormGroup

  this.http.post('http://localhost/iso2sys_rest_api/server.php', formData).subscribe((response: any) => {
    console.log('Upload successful', response);
    this.this_lessons_files_recover(this.AddFilesFormGroup.value.lesson_id).then((files: any[]) => {
      this.fileList = files; // Asigna el resultado una vez que la Promise se resuelve
    }).catch(error => {
      console.error('Error recuperando los archivos de la lección:', error);
    });
  });
}
/**********************************END QUERYS*************************************** */


firstLetterUpperCase(word: string): string {
  return word.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
} 

capitalizeWords(str : string) : string {
return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}


openDialog() {
  this.AddLessonFormGroup.patchValue({
    order: 0,
    title: "",
    content: "",
    lesson_order: 0,
    summary: "",
    url: ""
  }); 

  this.showdialog = true;
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
}

hideEditDialog() {
  this.showeditdialog = false;
}



}
