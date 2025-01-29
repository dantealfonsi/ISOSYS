import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './user-navbar.component.html',
  styleUrl: './user-navbar.component.css'
})
export class UserNavbarComponent {


  constructor(private cookieService: CookieService,private router: Router,public authService: AuthService) {};

  user: string | undefined

  ngOnInit(): void {

    if (!this.authService.isAdmin()) {
      this.router.navigate(['home']);
    } 

    this.user = JSON.parse(localStorage.getItem('token') || '{}')?.email;


  }
  

  goToAboutUs() {
    this.router.navigate(['/about-us']);
  }

  goToTerms() {
    this.router.navigate(['/terms']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
    }
    
    goToUnits() {
      this.router.navigate(['/view-units']);
      }

    goToRegister() {
      this.router.navigate(['/register']);
    }

    goToMain() {
      this.router.navigate(['/main/index']);
    }
    
    goToLanding() {
      this.router.navigate(['/home']);
    }

        
    goToProfile() {
      this.router.navigate(['/profile']);
    }
}
