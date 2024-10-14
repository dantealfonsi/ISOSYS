import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {
  isToggled = false;
  isSmallScreen = window.innerWidth <= 1050;

  navItems = [
    {
      iconClass: 'fas fa-home',
      name: 'Home',
      subItems: [{ name: 'Sub-home 1' }, { name: 'Sub-home 2' }],
      expanded: false
    },
    {
      iconClass: 'fas fa-user',
      name: 'Profile',
      subItems: [{ name: 'Sub-profile 1' }, { name: 'Sub-profile 2' }],
      expanded: false
    },
    {
      iconClass: 'fas fa-envelope',
      name: 'Messages',
      subItems: [{ name: 'Sub-message 1' }, { name: 'Sub-message 2' }],
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

