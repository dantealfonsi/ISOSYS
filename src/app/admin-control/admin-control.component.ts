import { Component } from '@angular/core';
import { AdminNavbarComponent} from '../../assets/admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-control',
  standalone: true,
  imports: [AdminNavbarComponent],
  templateUrl: './admin-control.component.html',
  styleUrl: './admin-control.component.css'
})
export class AdminControlComponent {

}
