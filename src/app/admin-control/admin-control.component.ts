import { Component } from '@angular/core';
import { AdminNavbarComponent} from '../../assets/admin-navbar/admin-navbar.component';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
@Component({
  selector: 'app-admin-control',
  standalone: true,
  imports: [
    AdminNavbarComponent,
    RouterOutlet
    
  ],
  templateUrl: './admin-control.component.html',
  styleUrl: './admin-control.component.css'
})

export class AdminControlComponent {

   tokenData:any = {
    userid: 'pene',
    
  };
  
  constructor(private authService: AuthService, private router: Router) {}

   token = localStorage.getItem('token');


   ngOnInit(): void {
 

    
  }

  
  
  
}
