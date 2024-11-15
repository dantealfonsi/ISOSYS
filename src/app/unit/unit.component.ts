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
interface unit{
  id: string;
  name: string;
  order: string;
}

@Component({
  selector: 'app-unit',
  standalone: true,
  imports: [ 
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
  templateUrl: './unit.component.html',
  styleUrl: './unit.component.css'
})




export class UnitComponent {

  
  // ...
  addUnitFormGroup!: FormGroup;
  showdialog: boolean = false;
  showeditdialog: boolean = false;
  unitList: any;
  unitListMat: any;

  history: any;

  constructor(
    private _formBuilder: FormBuilder,
    private router: Router
  ) {}

  @ViewChild(MatPaginator) paginator : MatPaginator | undefined;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {    
    this.initializeFormGroups();
    this.loadList(); 
    
    this.history = { user: JSON.parse(localStorage.getItem('token') || '{}')?.id, person_id: JSON.parse(localStorage.getItem('token') || '{}')?.person_id };
  }

  


  async loadList() {
    try {
      this.unitList = await this.unitListRecover(); 
      this.unitListMat = new MatTableDataSource<unit>(this.unitList);
      this.unitListMat.paginator = this.paginator;  
      this.unitListMat.sort = this.sort;



    } catch (error) {
      console.error('Error al recuperar los datos de la lista:', error);
      // Maneja el error según tus necesidades
    }

    //this.dataSource = new MatTableDataSource(this.sectionList);
    //this.dataSource.paginator = this.paginator;
  }

  async unitListRecover() {
    try {
      const response = await fetch(
        "http://localhost/iso2sys_rest_api/server.php?unit_list="  
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


  initializeFormGroups() {
    this.addUnitFormGroup = this._formBuilder.group({
      id: ['0'],
      name: ["", Validators.required],
      order: ["", Validators.required]
    });
  }


  onEditList(id: string) {
    this.openEditDialog();
    const selectedId = id;
    const selectedUnit = this.unitList.find((p: { id: string; }) => p.id === selectedId);
    if (selectedUnit) {
      this.addUnitFormGroup.patchValue({
        id: selectedUnit.id,
        name: selectedUnit.name,
        order: selectedUnit.order,
      });
    }
    console.log("edit:",selectedUnit);
  }  

/////////////////////////////AGREGAR Y EDITAR ////////////////////




addUnit() {

  const datos = {
    addUnit: '',
    unit: this.addUnitFormGroup.value,
    history: this.history
  };

    if (this.addUnitFormGroup.valid){

      fetch('http://localhost/iso2sys_rest_api/server.php',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      }).then(response => response.json())
        .then(data => {
          console.log(data);
          if(data['icon']==='success'){
            Swal.fire({
              title: 'Nuevo Mensaje:',
              text: data['message'],
              icon: data['icon']
            });
            this.loadList();
            this.addUnitFormGroup.patchValue({
              name: ""
            })
            this.hideDialog();
          } else{
            Swal.fire({
              title: 'Nuevo Mensaje:',
              text: data['message'],
              icon: data['icon']
            });
          }
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


  editUnit() {
    const datos = {
      editUnit: '',
      unit: this.addUnitFormGroup.value,
      history: this.history

    };
  
      if (this.addUnitFormGroup.valid){
  
        fetch('http://localhost/iso2sys_rest_api/server.php',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        }).then(response => response.json())
          .then(data => {
              Swal.fire({
                title: 'Nuevo Mensaje:',
                text: data['message'],
                icon: data['icon']
              });
              this.loadList();
              this.hideEditDialog();
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

      
  onDropList(id: any) {
    const datos = {
      updateSingleFieldUnit: id,
      tabla: "units",
      campo: "isDeleted",
      whereCondition: `id = ${id}`,
      valor: 1,
      history: this.history

    };

    Swal.fire({
      title: "¿Estás seguro de deshabilitarlo?",
      text: "¡Esta asignatura no seguirá apareciendo en la lista!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, Deshabilítala"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Completado!",
          text: "La lista ha sido deshabilitada.",
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


  goToLessons(itemId: string) {
    this.router.navigate(['main/lessons', itemId]);
  }



////////////////////////////LISTAS////////////////////////////////

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.unitListMat.filter = filterValue.trim().toLowerCase();
  }

  downloadPdf(){
    var doc = new jsPDF();
    autoTable(doc,{html:"#content"});
    doc.save("Unidades");
  }
 
  openDialog() {
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

  firstLetterUpperCase(word: string): string {
    return word.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
} 

capitalizeWords(str : string) : string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

}
