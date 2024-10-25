import { Component } from '@angular/core';
import { FooterComponent } from "../../assets/footer/footer.component";
import { UserNavbarComponent } from "../../assets/user-navbar/user-navbar.component";

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [FooterComponent, UserNavbarComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {

}
