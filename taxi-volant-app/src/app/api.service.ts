import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000/auth';
  private url = 'http://localhost:3000/admin';
  private url3 = 'http://localhost:3000/api/reservations';
  private url2 = 'https://localhost:3000/uploads';
  private url4 = 'http://localhost:3000/api'; 
  private readonly TIMEOUT = 10000; // 10 secondes timeout

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Une erreur est survenue:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      console.error('Erreur côté client:', error.error.message);
    } else {
      // Erreur côté serveur
      console.error(
        `Code d'erreur ${error.status}, ` +
        `Message: ${error.error?.message || error.message}`);
    }
    
    return throwError(() => error);
  }

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
    return this.http.delete(`${this.url}/delete/${userId}`, { headers });
  }

  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get(`${this.apiUrl}/me`, { headers });
  }

  updateUser(user: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/update`, user, { headers });
  }

  resetPassword(data: { email: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  // Méthode pour ajouter un taxi
  addTaxi(taxiData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.url}/add`, taxiData, { headers });
  }

  getTaxis(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.url}/list-taxi`, { headers });
  }

  // Nouvelle méthode pour récupérer un taxi par ID
  getTaxiById(taxiId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.url}/taxi/${taxiId}`, { headers });
  }

  // Nouvelle méthode pour mettre à jour un taxi
  updateTaxi(taxiId: number, taxiData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.url}/update/taxi/${taxiId}`, taxiData, { headers });
  }

  // Nouvelle méthode pour supprimer un taxi
  deleteTaxi(taxiId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.url}/delete/taxi/${taxiId}`, { headers });
  }

  acheterTaxi(proprietaireId: number, taxiId: number): Observable<any> {
    const body = {
      proprietaire_id: proprietaireId,
      taxi_id: taxiId,
    };
    return this.http.post(`${this.apiUrl}/acheter-taxi`, body);
  }
  // Ajoutez cette méthode dans ApiService

getPurchasedTaxis(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`${this.apiUrl}/mes-taxis`, { headers });
}
// In ApiService class
reserveTaxi(taxiId: number): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
  return this.http.post(`${this.apiUrl}/reserver-taxi`, { taxi_id: taxiId }, { headers });
}

// Cancel Reservation
cancelReservation(taxiId: number): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
  return this.http.post(`${this.apiUrl}/annuler-reservation`, { taxi_id: taxiId }, { headers });
}
// Nouvelle méthode pour récupérer les taxis disponibles
getAvailableTaxis(): Observable<any[]> {
  const token = localStorage.getItem('token'); // Retrieve the token from local storage
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Set the authorization header
  return this.http.get<any[]>(`${this.apiUrl}/taxis-disponibles`, { headers }); // Adjust the URL if necessary
}
// Méthode pour réserver un taxi avec des détails supplémentaires
reserveTaxiDetails(reservationData: {
  user_id: number; // Changer taxi_id à user_id
  taxi_id: number | null; // This should match your actual data
  proprietaire_id: number | null; // Assuming proprietaire_id can also be null
  userLocation: string;
  destination: string;
  distance: number;
  travelTime: number;
  departureTime: string;
  arrivalTime: string;
  travelCost: number | null; // Change this line
  weather: any;
}): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  // Effectuer l'appel HTTP POST avec les données de réservation
  return this.http.post(`${this.url3}/create-reservation`, reservationData, { headers });
}
getUserReservations(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any>(`${this.url3}/get-reservations`, { headers });
}

getReservationsByTaxi(taxiId: number): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`${this.url3}/get-reservations-by-taxi/${taxiId}`, { headers });
}
checkTaxiAvailability(taxi_id: string, departureTime: string, arrivalTime: string) {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post<{ available: boolean }>(
    `${this.url3}/check-taxi-availability`, 
    { taxi_id, departureTime, arrivalTime }, 
    { headers } // Set headers here
  );
}
getAllReservations(): Observable<any> {
  const token = localStorage.getItem('token');
  
  // Check if token exists
  if (!token) {
    console.error('No token found. Please log in.');
    return throwError('No token found');
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get(`${this.url3}/get-all-reservations`, { headers }).pipe(
    catchError((error) => {
      console.error('Error fetching reservations:', error);
      return throwError(error);
    })
  );
}


}