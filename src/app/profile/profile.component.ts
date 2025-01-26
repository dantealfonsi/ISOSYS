import { AdminNavbarComponent} from '../../assets/admin-navbar/admin-navbar.component';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component,computed,signal,OnInit, ViewChild} from '@angular/core';
import { MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CustomSidenavComponent} from '../../assets/custom-sidenav/custom-sidenav.component';
import { CommonModule } from "@angular/common";
import { CookieService } from 'ngx-cookie-service';
import {MatTabsModule} from '@angular/material/tabs';
import { UserNavbarComponent } from "../../assets/user-navbar/user-navbar.component";
import { FooterComponent } from "../../assets/footer/footer.component";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatListModule } from "@angular/material/list";
import { ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import Swal from "sweetalert2";
import { Subject } from "rxjs";
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule, provideNativeDateAdapter} from '@angular/material/core';
import {MatRadioModule} from '@angular/material/radio';
import {MatMenuModule} from '@angular/material/menu';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';

interface Marks {
  unit_name: string;  
  unit_order: string;
  exam_title: string;
  score: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterOutlet,MatPaginatorModule,MatTableModule,MatSortModule,MatToolbarModule,MatNativeDateModule,MatDatepickerModule,FormsModule,ReactiveFormsModule,MatListModule,MatSelectModule,MatInputModule,MatFormFieldModule,MatTabsModule, MatIconModule, MatButtonModule, MatSidenavModule, CustomSidenavComponent, CommonModule, UserNavbarComponent, FooterComponent],
  templateUrl: './profile.component.html',
  animations: [
    trigger('enterAnimation', [
        transition(':enter', [
            style({ transform: 'translateY(100%)', opacity: 0 }),
            animate('500ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
            style({ transform: 'translateY(0)', opacity: 1 }),
            animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 }))
        ])
    ])
],
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  userId?: string;
  userData?: any;

  markData: any;
  markDataMat: any;

  editUserFormGroup!: FormGroup;
  editPersonFormGroup!: FormGroup;

  selectedTabIndex = 0;

  
  constructor(private router: Router,private _formBuilder: FormBuilder,private cookieService: CookieService,private route: ActivatedRoute) {}

  @ViewChild(MatPaginator) paginator! : MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
      
  collapsed = signal(false);
  sidenavWidth = computed(() => this.collapsed() ? '65px' : '250px');



  show: boolean = false;

  openToggle() {
    this.show = true;
  }

  closeToggle() {
    this.show = false;
  }


  
 
ngOnInit() {
  this.initializeFormGroups(); // Inicializamos los formularios primero

  this.loadData();

  this.route.queryParams.subscribe(params => {
    if (params['fromExamCompletionDialog']) {
      this.selectedTabIndex = 1;
    }
  });
}

  initializeFormGroups() {
    this.editPersonFormGroup = this._formBuilder.group({
      nationality: ["",Validators.required],
      id: ['0'],
      cedula: ["", Validators.required],
      name: ["", Validators.required],
      second_name: ["35"],
      last_name: ["",Validators.required],
      second_last_name: ["35"],
      phone: ["",Validators.required, this.customPatternValidator(/^(\+58)?-?([04]\d{3})?-?(\d{3})-?(\d{4})\b/)],
      gender: ["",Validators.required],
      birthday: ["",Validators.required],
      address: ["",Validators.required],
    });

    this.editUserFormGroup = this._formBuilder.group({
      id: ['0'],
      email: [{value: '', disabled: true}, Validators.required], // Inicialmente deshabilitado      
      password: ["", Validators.required]
    });
  }


  patchValues() {
    // Asegúrate de que userData y person_id estén definidos antes de asignar los valores
    if (this.userData && this.userData.person_id) {
      this.editPersonFormGroup.patchValue({
        nationality: "",
        id: this.userData.person_id.id,
        cedula: this.userData.person_id.cedula,
        name: this.userData.person_id.name,
        second_name: this.userData.person_id.second_name,
        last_name: this.userData.person_id.last_name,
        second_last_name: this.userData.person_id.second_last_name,
        phone: this.userData.person_id.phone,
        gender: this.userData.person_id.gender,
        birthday: this.userData.person_id.birthday,
        address: this.userData.person_id.address
      });
  
      this.editUserFormGroup.patchValue({
        id: this.userData.user_id,
        email: this.userData.email,
        password: this.userData.password
      });
    } else {
      console.error('userData o person_id no están definidos.');
    }
  }
  


  
firstLetterUpperCase(word: string): string {
  return word.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
  } 
  
   capitalizeWords(str : string) : string {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
      
      
  //////////////////VALIDACIONES///////////////////////////////
  
  customPatternValidator(pattern: RegExp) {
    return (control: AbstractControl): Promise<ValidationErrors | null> => {
      return new Promise((resolve) => {
        if (pattern.test(control.value)) {
          resolve(null); // Valor válido
        } else {
          resolve({ customPattern: true }); // Valor no válido
        }
      });
    };
  }
  
  selectedNationality = 'V-'; // Valor predeterminado

  nationality = [
    { value: 'V-', label: 'V' },
    { value: 'E-', label: 'E' },
  ];


  ////////////////////////////////////////RECOVER DE LOS DATOS/////////////////////////

  async this_user_recover() {

    try {
        const response = await fetch(
            `http://localhost/iso2sys_rest_api/server.php?this_user_list=&id=${this.userId}`
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


async markListRecover() {
  try {
    const response = await fetch(
      `http://localhost/iso2sys_rest_api/server.php?mark_list=&user_id=${this.userId}`
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



async loadData() {
  // Paso 1: Obtener el valor del local storage
  const tokenString = localStorage.getItem('token');

  if (tokenString) {
    try {
      const token = JSON.parse(tokenString);

      if (token && token.id) {
        this.userId = token.id;
      } else {
        console.error('El token no contiene un id válido.');
      }
    } catch (e) {
      console.error('Error al parsear el token del local storage:', e);
    }
  } else {
    console.error('No se encontró el token en el local storage.');
  }

  // Asegúrate de que this_user_recover se complete antes de seguir
  this.userData = await this.this_user_recover();
  this.markData = await this.markListRecover();
  this.markDataMat = new MatTableDataSource<Marks>(this.markData);

  console.log('userData:', this.userData); // Verifica el contenido de userData
  console.log('MarkData:', this.markListRecover); // Verifica el contenido de marklist

  if (this.userData && this.userData.person_id) {
    this.patchValues(); // Llámalo solo después de que userData esté definido
  } else {
    console.error('userData o person_id no están definidos correctamente.');
  }
}



async editUser(){
  const datos = {
    editProfile: true, // Establece correctamente el indicador
    //user: this.editUserFormGroup.value,
    person: this.editPersonFormGroup.value
  };

  //console.log("Valor de user:", JSON.stringify(this.editUserFormGroup.value, null, 2));
  console.log("Valor de person:", JSON.stringify(this.editPersonFormGroup.value, null, 2));

  if (this.editPersonFormGroup.valid) {
    try {
      const response = await fetch('http://localhost/iso2sys_rest_api/server.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      const data = await response.json();

      Swal.fire({
        title: 'Actualizar Perfil',
        text: `${data.message}`,
        icon: data.icon
      });
    } catch (error) {
      console.error('Error aqui =>', error);
      Swal.fire({
        title: '¡Error!',
        text: 'Hubo un problema al actualizar los datos.',
        icon: 'error'
      });
    }
  } else {
    Swal.fire({
      title: '¡Datos no validos!',
      text: 'Alguno de los datos es invalido o la cédula ya es existente',
      icon: 'error'
    });    
  }    
}



applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.markDataMat.filter = filterValue.trim().toLowerCase();
}


downloadPdf(){
  var doc = new jsPDF();

    autoTable(doc,{html:"#content"});
    doc.save("Usuarios");
}




}




