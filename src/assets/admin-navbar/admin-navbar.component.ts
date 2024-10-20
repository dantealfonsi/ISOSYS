import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from '../../auth.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {
  isToggled = false;
  isSmallScreen = window.innerWidth <= 1050;
  toggleIcon: string  = 'keyboard_arrow_down';
  toggleBackground: string = '';

  constructor(private authService: AuthService,private router: Router) {}


  navItems = [
    {
      iconClass: 'fas fa-home',
      name: 'Home',
      expanded: false
    },
    {
      iconClass: 'fas fa-user',
      name: 'Unidades',
      route: 'unit',
      expanded: false,
    },
    {
      iconClass: 'card_membership',
      name: 'Usuarios',
      subItems: [{ name: 'Administradores' }, { name: 'Usuarios' }],
      expanded: false
    }
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSmallScreen = event.target.innerWidth <= 1050;
  }

  toggleSidenav() {
    this.isToggled = !this.isToggled;
  }

  toggleSubmenu(item: any) {
    item.expanded = !item.expanded;

    if (item.expanded) {
      this.toggleIcon = 'keyboard_arrow_up';
      
    } else{
      this.toggleIcon = 'keyboard_arrow_down';
    }

  }

  isActive(route: string | undefined): boolean {
    return this.router.url === route;
  }

}

