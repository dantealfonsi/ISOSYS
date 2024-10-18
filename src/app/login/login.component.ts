import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatListModule } from "@angular/material/list";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,    
    RouterOutlet,
    FormsModule
    
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {


goToRegister() {
  this.router.navigate(['/register']);
}

  
  email : string = '';
  password : string = '';

  //constructor(private auth : AuthService) { }


  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['main']);
    } else {
      this.router.navigate(['home']);
    }
    
  }

  async OnUserLogin(){
    alert(this.email +" / "+ this.password);

    if (this.email == ''){
      Swal.fire({
        title: 'Introduce un email!',
        text: 'Este usuario no existe.',
        icon: 'warning'
      });         
      return;
    }

    if (this.password == ''){
      Swal.fire({
        title: 'Introduce una contraseña!',
        text: 'Este usuario no existe.',
        icon: 'warning'
      });          
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['main']);
        } else {
          this.router.navigate(['home']);
        }
      },
      error: (error) => {
        Swal.fire({
          title: 'Datos Incorrectos!',
          text: error.message, // Asegúrate de mostrar el mensaje de error
          icon: 'error'
        });
      },
      complete: () => {
        console.log('Login request complete');
      }
    });
  }

}

