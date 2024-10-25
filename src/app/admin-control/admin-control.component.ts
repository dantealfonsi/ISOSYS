import { AdminNavbarComponent} from '../../assets/admin-navbar/admin-navbar.component';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component,computed,signal,OnInit} from '@angular/core';
import { MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CustomSidenavComponent
  
 } from '../../assets/custom-sidenav/custom-sidenav.component';
import { CommonModule } from "@angular/common";
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-admin-control',
  standalone: true,
  imports: [RouterOutlet,MatToolbarModule,MatIconModule,MatButtonModule,MatSidenavModule,CustomSidenavComponent,CommonModule],
  templateUrl: './admin-control.component.html',
  styleUrl: './admin-control.component.css',
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
})

export class AdminControlComponent {

   tokenData:any = {
    userid: 'pene',
    
  };
  
  constructor(public authService: AuthService, private router: Router) {}

   token = localStorage.getItem('token');


   ngOnInit(): void {

    if (!this.authService.isAdmin()) {
      this.router.navigate(['home']);
    } 
    

  }


    
  collapsed = signal(false);
  sidenavWidth = computed(() => this.collapsed() ? '65px' : '250px');



  show: boolean = false;

  openToggle() {
    this.show = true;
  }

  closeToggle() {
    this.show = false;
  }

  
  
  
}
