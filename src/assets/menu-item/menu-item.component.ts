import { Component, input, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../custom-sidenav/custom-sidenav.component';

@Component({
  selector: 'menu-item',
  standalone: true,
  imports: [MatListModule,RouterModule,MatIcon],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.css'
})
export class MenuItemComponent {

  item = input.required<MenuItem>();

  collapsed = input(false);

  nestedMenuOpen = signal(false);

  toggleNested(){
    if(!this.item().subItems) {
      return;
    }

    this.nestedMenuOpen.set(!this.nestedMenuOpen());
  }

}
   