import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; // Importación correcta
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    FormsModule
  ],
  providers: [AuthService],
  animations: [
    trigger('horizontalStepTransition', [
      state('start', style({ transform: 'translateX(0)' })),
      state('end', style({ transform: 'translateX(100%)' })),
      transition('start => end', animate('500ms ease-in')),
      transition('end => start', animate('500ms ease-out'))
    ])
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Test_Management_System';
}
