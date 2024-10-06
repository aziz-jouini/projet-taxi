import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  isSidebarOpen = false; // Variable pour gérer l'état de la sidebar

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getUsers();
  }

  // Récupérer la liste des utilisateurs
  getUsers(): void {
    this.apiService.getUsers().subscribe(
      (data) => {
        this.users = data;
        console.log(this.users); // Ajoutez ceci pour déboguer
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    );
  }

  // Ouvrir la sidebar
  openSidebar(): void {
    this.isSidebarOpen = true;
  }

  // Fermer la sidebar
  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  // Activer un utilisateur
  activateUser(userId: number): void {
    this.apiService.activateUser(userId).subscribe(
      (response) => {
        console.log('Utilisateur activé avec succès:', response);
        this.getUsers(); // Mettre à jour la liste des utilisateurs après activation
      },
      (error) => {
        console.error('Erreur lors de l’activation de l’utilisateur', error);
      }
    );
  }

  // Désactiver un utilisateur
  deactivateUser(userId: number): void {
    this.apiService.deactivateUser(userId).subscribe(
      (response) => {
        console.log('Utilisateur désactivé avec succès:', response);
        this.getUsers(); // Mettre à jour la liste des utilisateurs après désactivation
      },
      (error) => {
        console.error('Erreur lors de la désactivation de l’utilisateur', error);
      }
    );
  }

  // Supprimer un utilisateur
  deleteUser(userId: number): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) { // Demande de confirmation
      this.apiService.deleteUser(userId).subscribe(
        (response) => {
          console.log('Utilisateur supprimé avec succès:', response);
          this.getUsers(); // Mettre à jour la liste des utilisateurs après suppression
        },
        (error) => {
          console.error('Erreur lors de la suppression de l’utilisateur', error);
        }
      );
    }
  }
}
