import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {
  isToggled = false;
  isSmallScreen = window.innerWidth <= 1050;

  constructor(private authService: AuthService) {}


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
      iconClass: 'fas fa-envelope',
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
  }
}

