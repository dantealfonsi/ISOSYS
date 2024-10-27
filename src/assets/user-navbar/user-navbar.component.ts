import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './user-navbar.component.html',
  styleUrl: './user-navbar.component.css'
})
export class UserNavbarComponent {


  constructor(private cookieService: CookieService,private router: Router,public authService: AuthService) {};

    
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

    
    goToLanding() {
      this.router.navigate(['/home']);
    }
}
