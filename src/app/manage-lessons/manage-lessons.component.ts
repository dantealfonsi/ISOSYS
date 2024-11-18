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
  videoList:any;
  AddLessonFormGroup: any;
  AddFilesFormGroup: any;
  AddVideoFormGroup: any;

  showdialog: boolean = false;
  showeditdialog: boolean = false;
  showFilesdialog: boolean = false;

  dataSource: any;
  selectedFiles!: FileList;

  ////HISTORIAL///
  history: any;


  constructor(private _formBuilder: FormBuilder, private route: ActivatedRoute,private http: HttpClient,private router: Router) {}


  /////CAMBIAR SELECCION DE VIDEOS/////////////
  selectedOption!: string; 
  
  onSelectionChange(event: any): void { this.selectedOption = event.value; }


  urlValidator(control: AbstractControl): { [key: string]: any } | null {
    if (this.selectedOption === 'video' && control.value) {
      const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
      return youtubeRegex.test(control.value) ? null : { 'invalidUrl': true };
    }
    return null; // Si no es 'url', no aplica la validación
  }

  onOptionChange(option: string) {
    this.selectedOption = option;
    
    if (option === 'video') {

      this.AddLessonFormGroup.patchValue({ url: '' }); // Actualiza el campo 'url' con el nombre del archivo

      this.AddLessonFormGroup.get('subir')?.setValidators(null);
    } else {
      this.AddLessonFormGroup.get('subir')?.setValidators([this.urlValidator.bind(this)]);
    }
    this.AddLessonFormGroup.get('subir')?.updateValueAndValidity();
  }



  /////FIN DE CAMBIAR SELECCION DE VIDEOS/////////////


  initializeFormGroups() {
    this.AddLessonFormGroup = this._formBuilder.group({
      id: [''],
      unitId: [this.itemId = this.route.snapshot.paramMap.get('id')],
      title: ["", Validators.required],
      content: [''],
      lesson_order: ['', [Validators.required, Validators.min(1)]],      
      summary: ["",Validators.required],
      url: ["", [this.urlValidator.bind(this)]], // Añadir la validación personalizada
    });

    this.AddFilesFormGroup = this._formBuilder.group({
      lesson_id: [""],
      file: this._formBuilder.array([], Validators.required)
    });

    this.AddVideoFormGroup = this._formBuilder.group({
      lesson_id: [""],
      file: this._formBuilder.array([], Validators.required)
    });

  }

ngOnInit(): void {
  
  this.itemId = this.route.snapshot.paramMap.get('id');
  this.initializeFormGroups();
  this.loadList();

  this.history = { user: JSON.parse(localStorage.getItem('token') || '{}')?.id, person_id: JSON.parse(localStorage.getItem('token') || '{}')?.person_id };

  
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

async this_lessons_videos_recover(id:number) {
  try {
    const response = await fetch(
      "http://localhost/iso2sys_rest_api/server.php?this_lessons_videos=&id="+id,
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
    lesson: this.AddLessonFormGroup.value,
    history: this.history
  };

  if (this.AddLessonFormGroup.valid) {
    fetch('http://localhost/iso2sys_rest_api/server.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
      if (data.icon === 'success' && data.lesson_id) {
        Swal.fire({
          title: 'Lección añadida!',
          text: 'La Lección fue añadida con éxito.',
          icon: 'success'
        }).then(() => {
          this.uploadVideos(data.lesson_id); // Llamar a la función para subir videos con el ID de la lección
        });
      } else {
        Swal.fire({
          title: '¡Error!',
          text: data.message,
          icon: data.icon
        });
      }
      this.loadList();
      this.hideDialog();
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        title: '¡Error!',
        text: 'Hubo un problema al añadir la lección.',
        icon: 'error'
      });
    });

  } else {
    Swal.fire({
      title: '¡Faltan Datos en este formulario!',
      text: 'No puedes agregar debido a que no has ingresado todos los datos.',
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

editLesson() {
  const datos = {
    editLesson: "",
    lesson: this.AddLessonFormGroup.value,
    history: this.history

  };
  
  const lesson_id = this.AddLessonFormGroup.get('id')?.value;

  if (this.AddLessonFormGroup.valid && lesson_id) {
    fetch('http://localhost/iso2sys_rest_api/server.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
      if (data.icon === 'success') {
        Swal.fire({
          title: 'Sección Editada con Éxito!',
          text: 'Esta sección ha sido editada con éxito.',
          icon: 'success'
        }).then(() => {
          this.uploadEditVideos(lesson_id); // Llamar a la función para subir videos con el ID de la lección
        });
      } else {
        Swal.fire({
          title: '¡Error!',
          text: data.message,
          icon: data.icon
        });
      }
      this.loadList();
      this.hideEditDialog();
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        title: '¡Error!',
        text: 'Hubo un problema al editar la lección.',
        icon: 'error'
      });
    });

  } else {
    Swal.fire({
      title: '¡Faltan Datos en este formulario!',
      text: 'No puedes editar debido a que no has ingresado todos los datos.',
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
    this.AddFilesFormGroup.get('file').value.push(this.selectedFiles[i].name);
  }
  formData.append('addFile', 'true');
  formData.append('lesson_id', this.AddFilesFormGroup.value.lesson_id);

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
          this.this_lessons_files_recover(this.AddFilesFormGroup.value.lesson_id).then((files: any[]) => {
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

uploadVideos (lesson_id: number) {
  const formData = new FormData();

  // Validar que solo hay un video seleccionado
  if (this.selectedVideos.length !== 1) {
    Swal.fire({
      title: 'Error',
      text: 'Solo puedes subir un video a la vez.',
      icon: 'error'
    });
    return;
  }

  formData.append('files[]', this.selectedVideos[0], this.selectedVideos[0].name);
  formData.append('addVideo', 'true');
  formData.append('lesson_id', lesson_id.toString());

  this.http.post('http://localhost/iso2sys_rest_api/server.php', formData).subscribe((response: any) => {
    const res = response[0]; // Esperamos que la respuesta sea un array con un solo objeto
    if (res.status === 'exists') {
      Swal.fire({
        title: '¡Advertencia!',
        text: `Ya existe un archivo con el nombre ${res.file} en esta lección. ${res.message}`,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    } else if (res.status === 'success') {
      this.this_lessons_videos_recover(lesson_id).then((files: any[]) => {
        this.videoList = files;
        this.AddLessonFormGroup.patchValue({ url: this.selectedVideos[0].name }); // Actualiza el campo 'url' con el nombre del archivo
        Swal.fire(
          '¡Éxito!',
          'El archivo se ha subido correctamente.',
          'success'
        );
      }).catch(error => {
        console.error('Error recuperando los archivos de la lección:', error);
      });
    } else {
      console.error('Error del servidor:', res.message);
      Swal.fire(
        'Error',
        `Hubo un problema al subir el archivo: ${res.message}`,
        'error'
      );
    }
  });
}


uploadEditVideos(lesson_id: number) {
  const formData = new FormData();

  if (this.selectedVideos.length !== 1) {
    Swal.fire({
      title: 'Error',
      text: 'Solo puedes subir un video a la vez.',
      icon: 'error'
    });
    return;
  }

  const selectedVideo = this.selectedVideos[0];
  formData.append('files[]', selectedVideo, selectedVideo.name);
  formData.append('addVideo', 'true');
  formData.append('lesson_id', lesson_id.toString());

  this.http.post('http://localhost/iso2sys_rest_api/server.php', formData).subscribe((response: any) => {
    const res = response[0];
    if (res.status === 'exists') {
      Swal.fire({
        title: '¡Advertencia!',
        text: `Ya existe un archivo con el nombre ${res.file} en esta lección. ${res.message}`,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    } else if (res.status === 'success') {
      this.this_lessons_videos_recover(lesson_id).then((files: any[]) => {
        this.videoList = files;
        this.AddLessonFormGroup.patchValue({ url: selectedVideo.name }); // Actualiza el campo 'url' con el nombre del archivo
        Swal.fire(
          '¡Éxito!',
          'El archivo se ha subido correctamente.',
          'success'
        );
      }).catch(error => {
        console.error('Error recuperando los archivos de la lección:', error);
      });
    } else {
      console.error('Error del servidor:', res.message);
      Swal.fire(
        'Error',
        `Hubo un problema al subir el archivo: ${res.message}`,
        'error'
      );
    }
  });
}





onDeleteFile(fileName: string) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esta acción',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminarlo',
    cancelButtonText: 'No, cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const formData = new FormData();
      formData.append('fileName', fileName); // Añade el nombre del archivo a borrar
      formData.append('lesson_id', this.AddFilesFormGroup.value.lesson_id); // Añade lesson_id
      this.http.post('http://localhost/iso2sys_rest_api/server.php', formData).subscribe((response: any) => {
        console.log('Archivo eliminado', response);
        this.fileList = this.fileList.filter((file: { name: string; }) => file.name !== fileName); // Actualiza la lista de archivos en el cliente
        Swal.fire('Eliminado!', 'Tu archivo ha sido eliminado.', 'success');
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire('Cancelado', 'Tu archivo está seguro', 'error');
    }
  });
}





onDropList(id: any) {
  const datos = {
    updateSingleFieldLesson: id,
    tabla: "lessons",
    campo: "isDeleted",
    whereCondition: `id = ${id}`,
    valor: 1,
    history: this.history

  };

  Swal.fire({
    title: "¿Estás seguro de deshabilitarlo?",
    text: "¡Esta Lección no seguirá apareciendo en la lista!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, Deshabilítala"
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "¡Completado!",
        text: "La lección ha sido deshabilitada.",
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
  this.router.navigate(['main/unit']);
}

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






selectedVideos: File[] = []; // Definir el tipo como un arreglo de archivos

onSelectVideos(event: any) {
  const videos = event.target.files;
  const invalidVideos = [];

  // Limpiar el arreglo de videos seleccionados previamente
  this.selectedVideos = [];

  for (let i = 0; i < videos.length; i++) {
    const fileExtension = videos[i].name.split('.').pop().toLowerCase();
    if (fileExtension !== 'mp4') {
      invalidVideos.push(videos[i].name);
    } else {
      this.selectedVideos.push(videos[i]);
    }
  }

  if (invalidVideos.length > 0) {
    Swal.fire({
      title: 'Error',
      text: `Los siguientes archivos no tienen la extensión .mp4: ${invalidVideos.join(', ')}`,
      icon: 'error'
    });
    // Limpiar la selección de archivos no válidos
    event.target.value = '';
  } else if (this.selectedVideos.length > 0) {
    const selectedFileName = this.selectedVideos[0].name;
    this.AddLessonFormGroup.patchValue({ url: selectedFileName }); // Actualiza el campo 'url' con el nombre del archivo
    Swal.fire({
      title: 'Archivos seleccionados',
      text: `Todos los archivos tienen la extensión .mp4`,
      icon: 'success'
    });
  }
}







}
