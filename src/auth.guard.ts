import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
      if (this.authService.isAdmin()) {
        return true;
    } else {
        return false;
        this.router.navigate(['home']);
        // Redirige y previene la navegación original
     }
    }

  }
