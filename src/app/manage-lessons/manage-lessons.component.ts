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
    MatCardModule
  ],
  templateUrl: './manage-lessons.component.html',
  styleUrl: './manage-lessons.component.css'
})
export class ManageLessonsComponent {
  itemId!: string | null;
  unitData: any;
  lessonData: any;
  AddLessonFormGroup: any;
  showdialog: boolean = false;
  showeditdialog: boolean = false;
  dataSource: any;

  constructor(private _formBuilder: FormBuilder, private route: ActivatedRoute,) {}



  initializeFormGroups() {
    this.AddLessonFormGroup = this._formBuilder.group({
      unitId: [this.itemId = this.route.snapshot.paramMap.get('id')],
      title: ["", Validators.required],
      content: [''],
      lesson_order: ["",Validators.required],
      summary: ["",Validators.required],
      url: ["",Validators.required],
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
      order: selectedLesson.order,
      title: selectedLesson.title,
      content: selectedLesson.content,
      lesson_order: selectedLesson.lesson_order,
      summary: selectedLesson.summary,
      url: selectedLesson.url 
    });
  }
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

get guias() {
  return this.AddLessonFormGroup.get('guias') as FormArray;
}

addGuia(file: File) {
  const url = URL.createObjectURL(file);
  this.guias.push(this._formBuilder.group({
    name: file.name,
    url,
    type: this.getFileType(file)
  }));
}

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.addGuia(file);
  }
}

getFileType(file: any): string {
  const extension = file.name.split('.').pop();
  if (extension === 'pdf') {
    return 'pdf';
  } else if (extension === 'doc' || extension === 'docx') {
    return 'word';
  } else if (extension === 'xls' || extension === 'xlsx') {
    return 'excel';
  } else {
    return 'other';
  }
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


hideDialog() {
  this.showdialog = false;
}

hideEditDialog() {
  this.showeditdialog = false;
}



}
