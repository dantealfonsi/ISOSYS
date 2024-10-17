import { Component } from '@angular/core';
import { AdminNavbarComponent} from '../../assets/admin-navbar/admin-navbar.component';
import { RouterOutlet } from '@angular/router';
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

}
