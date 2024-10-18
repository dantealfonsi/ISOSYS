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
          this.setToken(response.token,response.isAdmin);
          console.log('Token guardado:', response.token);
        } else{
          throw new Error('Usuario O Contraseña incorrectos'); // Fuerza un error si el token no está presente
        }
        return false;
      })
    );
  }
  
  setToken(token: any,isAdmin:string): void {
    console.log('Set token:', token); // Verifica que el token no sea nulo o indefinido
    localStorage.setItem('token', JSON.stringify(token)); // con esto se guarda en el localstore un JSON
    localStorage.setItem('user', isAdmin);

    /*if(isAdmin === '0'){
      localStorage.setItem('user', isAdmin);
    } else {
      localStorage.setItem('admin', isAdmin);
    }*/
  }

  getToken(token:string): any | null {
    return localStorage.getItem(token);
  }

  
  getAdminToken(): string | null {
    return localStorage.getItem('user');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['login']);
  }

  isAdmin(): boolean {
    const obj = JSON.parse(this.getToken('token'));
    if (obj.isAdmin === '1') {
      return true;
    }
    return false;
  }
}
