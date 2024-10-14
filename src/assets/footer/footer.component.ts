import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

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
