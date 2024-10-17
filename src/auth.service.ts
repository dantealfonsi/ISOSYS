import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost/iso2sys_rest_api/server.php';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<any>(this.apiUrl, { email, password, login: true }).pipe(
      map(response => {
        console.log('Response:', response); // Verifica la respuesta completa
        if (response && response.token) {
          this.setToken(response.token);
          console.log('Token guardado:', response.token);
          return response.isAdmin === true;
        }
        return false;
      })
    );
  }
  
  setToken(token: string): void {
    console.log('Set token:', token); // Verifica que el token no sea nulo o indefinido
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['login']);
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.isAdmin === 1;
    }
    return false;
  }
}
