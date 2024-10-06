import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  user = {
    firstName: '',
    lastName: '',
    derniere_connexion: '',
    role: ''
  };

  constructor(private userService: ApiService) {}

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe(
      (data) => {
        this.user = {
          firstName: data.prenom,
          lastName: data.nom,
          derniere_connexion: data.derniere_connexion,
          role: data.type
        };
      },
      (error) => {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
      }
    );
  }
}
