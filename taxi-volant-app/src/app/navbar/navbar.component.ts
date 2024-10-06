import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  constructor(private router: Router) {}

  logout() {
    // Supprimer le token du local storage
    localStorage.removeItem('token');
    
    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }
}
