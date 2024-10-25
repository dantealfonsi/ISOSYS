import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-add-admins',
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
    MatButtonModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatTooltipModule,
    RouterOutlet,
    RouterModule,
    RouterLink,
  ],
  templateUrl: './add-admins.component.html',
  styleUrl: './add-admins.component.css'
})
export class AddAdminsComponent {


  selected = 'Tutor Legal';

  @ViewChild('stepper') private stepper!: MatStepper;

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  formattedDate!:  string;
  person!: any[];

  private readonly _currentYear = new Date().getFullYear();
  readonly minDate = new Date(this._currentYear - 100, 0, 1);
  readonly maxDate = new Date(this._currentYear - 18, 0, 1);

  constructor(private _formBuilder: FormBuilder,private router: Router,private cookieService: CookieService) {

  }

  
  ngOnInit() {
    this.initializeFormGroups();
    this.loadParentList();
  }

  
  initializeFormGroups() {
    this.firstFormGroup = this._formBuilder.group({
      nationality: ['', Validators.required],
      cedula: ['', Validators.required, this.customPatternValidator(/^[0-9]{1,2}-?[.]?[0-9]{3}-?[.]?[0-9]{3}$/)],
      name: ['', Validators.required],
      second_name: [''],
      last_name: ['', Validators.required],
      second_last_name: [''],
      gender: [''],
      phone: ['', Validators.required,this.customPatternValidator(/^(\+58)?-?([04]\d{3})?-?(\d{3})-?(\d{4})\b/)],
      birthday: ['', Validators.required],
      address: ['', Validators.required],
    });

    this.secondFormGroup = this._formBuilder.group({
      // Repite los campos del primer paso si es necesario
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[A-Za-z])[0-9A-Za-z!@#$%]{8,20}$/)]],
      confirmPassword: ['', Validators.required],
      isAdmin: [''],
    }, { validators: AddAdminsComponent.MatchValidator('password','confirmPassword') }
  )
    
  }

  ////////////Validaciones//////////////////
  getPasswordError(): string {
    const passwordControl = this.secondFormGroup.get('password');
    if (passwordControl!.hasError('required')) {
      return 'La contraseña es obligatoria.';
    }
  
    if (passwordControl!.hasError('pattern')) {
      return 'La contraseña no cumple con los requisitos.';
    }
    return '';
  }

  static MatchValidator(source: string, target: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      const targetCtrl = control.get(target);

      return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value
        ? { mismatch: true }
        : null;
    };
  }


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


  get passwordMatchError() {
    return (
      this.secondFormGroup.getError('mismatch') &&
      this.secondFormGroup.get('confirmPassword')?.touched
    );
  }

  ////////////////////////////////////////////

  async loadParentList() {

    this.person = await this.person_list_recover();
    // ... cualquier otra lógica que dependa de 'parent'
  }

  goForward() { 
    this.stepper.next();
  }
  
  goBack() {
    this.stepper.previous();
  }

  async person_list_recover() {
    try {
      const response = await fetch('http://localhost/iso2sys_rest_api/server.php?person_list=');
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


  onYearStudentChange(event:any){
    alert(event);
  }

  onCedulaChange(event: any) {

    const selectedCedula = event.target.value;
    const selectedParent = this.person.find(p => p.cedula === selectedCedula);
  
    if (selectedParent) {
      this.firstFormGroup.patchValue({
        nationality: selectedParent.nationality,
        cedula: selectedParent.cedula,
        name: selectedParent.name,
        second_name: selectedParent.second_name,
        last_name: selectedParent.last_name,
        second_last_name: selectedParent.second_last_name,
        gender: selectedParent.gender,
        phone: selectedParent.phone,
        birthday: selectedParent.birthday,
        address: selectedParent.address
      }); 
    }
  }

  addUser(){
    const datos = {
      addAdmin: "",
      person: this.firstFormGroup.value,
      userData: this.secondFormGroup.value
    };

    if (this.firstFormGroup.valid && this.secondFormGroup.valid) {
      // El formulario tiene valores válidos
      console.log('Formulario de Inscripción');
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

        Swal.fire({
          title: 'Mensaje!',
          text: data['message'],
          icon: data['icon']
        }).then(() => {
          if (!data['message'].includes('Error')) {
            this.router.navigate(['main/admin']);
          }
        });
  
      }).then()
      .catch(error => {
        console.error('Error:', error);
      });

    } else {
      // El formulario no tiene valores válidos
      alert("Error en el llenado de datos");
      console.log('Formulario inválido');
    }    
  }

  firstLetterUpperCase(word: string): string {
    return word.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
}  

goToView(){
  this.router.navigate(['main/admin']);
}



//////////////////////////////////////////////////CEDULA EMPIEZA CON V//////////////////////////

selectedNationality = 'V-'; // Valor predeterminado

nationality = [
  { value: 'V-', label: 'V' },
  { value: 'E-', label: 'E' },
];
  

}
