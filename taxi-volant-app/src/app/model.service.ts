import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private apiUrl = 'http://localhost:3000'; // Your API base URL

  constructor(private http: HttpClient) {}



  recommendTaxi(criteria: { user_lat: number; user_lng: number; weather: string; distance: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recommend`, criteria);
  }
}
