import { Component } from '@angular/core';
import { UserNavbarComponent } from "../../assets/user-navbar/user-navbar.component";
import { FooterComponent } from "../../assets/footer/footer.component";

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [UserNavbarComponent, FooterComponent],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css'
})
export class TermsComponent {

}
