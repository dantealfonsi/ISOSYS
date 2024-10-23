import { CommonModule } from '@angular/common';
import { Component,signal,computed, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { CookieService } from 'ngx-cookie-service';


export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
}



@Component({
    selector: 'custom-sidenav',
    standalone: true,
    templateUrl: './custom-sidenav.component.html',
    styleUrl: './custom-sidenav.component.css',
    imports: [CommonModule, MatListModule, MatIconModule, RouterLink, RouterModule, MenuItemComponent]
})

export class CustomSidenavComponent {

  constructor(private cookieService: CookieService) {}

    sideNavCollapsed = signal(false);
item: any;

    @Input() set collapsed(val: boolean) {
      this.sideNavCollapsed.set(val);
    } 

  menuItems = signal<MenuItem[]>([
    {
      icon: 'dashboard',
      label: 'Inicio',
      route: 'dashboard'
    },

    {
      icon: 'border_color',
      label: 'Unidades',
      route: 'unit',
    },

    {
      icon: 'recent_actors',
      label: 'Usuarios',
      subItems:[
        {
          icon: 'border_color',
          label: 'Administradores',
          route: 'addTeacher',
        },
        {
          icon: 'border_color',
          label: 'Usuarios',
          route: 'viewTeacher'
        },
      ]
    },
    {
      icon: 'supervised_user_circle',
      label: 'Reportes',
      route: 'viewUsers'

    },
  ])

  
  profilePicSize = computed(() => this.sideNavCollapsed() ? '60' : '120');






}
