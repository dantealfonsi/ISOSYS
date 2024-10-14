import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [
    
  ],
  templateUrl: './user-navbar.component.html',
  styleUrl: './user-navbar.component.css'
})
export class UserNavbarComponent {


  constructor(private cookieService: CookieService,private router: Router) {};

    
  goToAboutUs() {
    this.router.navigate(['/about-us']);
  }

  goToTerms() {
    this.router.navigate(['/terms']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
    }
    
    goToRegister() {
      this.router.navigate(['/register']);
    }

}
