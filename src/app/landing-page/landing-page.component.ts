import { Component } from '@angular/core';
import { UserNavbarComponent } from '../../assets/user-navbar/user-navbar.component';
import { FooterComponent } from '../../assets/footer/footer.component';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    UserNavbarComponent,
    FooterComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

  
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

    goToClass(){
      this.router.navigate(['/view-units']);
    }
    
}
