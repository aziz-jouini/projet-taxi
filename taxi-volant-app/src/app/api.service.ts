import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000/auth';
  private url = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) {}

  // Méthode pour l'inscription
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Méthode pour le login
  login(credentials: { email: string, mot_de_passe: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
  
  verifyGoogleUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-google-user`, { token: user.idToken });
  }

  getUsers(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.url}/users`, { headers });
  }

  activateUser(userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.url}/activate`, { userId }, { headers });
  }

  // Nouvelle méthode pour désactiver un utilisateur
  deactivateUser(userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.url}/deactivate`, { userId }, { headers });
  }

  // Nouvelle méthode pour supprimer un utilisateur
  deleteUser(userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.url}/delete/${userId}`, { headers }); // Corrigé ici : ajout du slash '/'
  }

  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token'); // Assurez-vous que le token est bien stocké localement après la connexion
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/me`, { headers });
  }

  updateUser(user: any): Observable<any> { // Utilisation de 'any' au lieu d'un modèle
    const token = localStorage.getItem('token'); // Récupérer le token de l'utilisateur
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/update`, user, { headers });
  }
}
