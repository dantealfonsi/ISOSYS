import { Component,computed,signal,OnInit} from '@angular/core';
import { MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CustomSidenavComponent } from '../custom-sidenav/custom-sidenav.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from "@angular/common";
import { animate, style, transition, trigger } from '@angular/animations';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'sidenav',
  standalone: true,
  imports: [CommonModule,MatToolbarModule,MatIconModule,MatButtonModule,MatSidenavModule,CustomSidenavComponent,RouterOutlet],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
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
export class SidenavComponent {

  constructor(private cookieService: CookieService,private router: Router) {};

  ngOnInit(): void {
    // Verificar si la cookie está presente
    if (!this.cookieService.get('user_id')) {
      // Redirigir al componente de inicio de sesión
      this.router.navigate(['/login']);
    }
  }
  
logout() {
  this.cookieService.delete('user_id');
  this.cookieService.delete('isAdmin');
  this.router.navigate(['/login']);
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
