import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = { // Utilisation d'un objet JavaScript simple
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'client'
  };

  constructor(private authService: ApiService, private router: Router) {}

  ngOnInit(): void {
    // Récupérer les données de l'utilisateur connecté
    this.authService.getUserProfile().subscribe(
      (data) => {
        // Mapper les données récupérées aux propriétés appropriées
        this.user.firstName = data.prenom; // Remplacez 'prenom' par 'firstName'
        this.user.lastName = data.nom; // Remplacez 'nom' par 'lastName'
        this.user.email = data.email;
        this.user.type = data.type; // Le type peut rester tel quel
        console.log('Données utilisateur récupérées:', this.user); // Affiche les données de l'utilisateur dans la console
      },
      (error) => {
        console.error('Erreur lors de la récupération des données utilisateur', error);
      }
    );
  }

  onSubmit(): void {
    // Vérification des mots de passe avant de soumettre
    if (this.user.password && this.user.password !== this.user.confirmPassword) {
      console.error('Les mots de passe ne correspondent pas');
      return;
    }

    // Préparer les données à envoyer à la base de données
    const userData = {
      nom: this.user.lastName, // Mapper lastName à nom
      prenom: this.user.firstName, // Mapper firstName à prenom
      email: this.user.email,
      mot_de_passe: this.user.password, // Mapper password à mot_de_passe
      type: this.user.type
    };

    this.authService.updateUser(userData).subscribe(
      (response) => {
        console.log('Profil mis à jour avec succès', response);
        // Rediriger ou afficher un message de succès
        this.router.navigate(['/profile']); // Redirection vers la page de profil
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du profil', error);
      }
    );
  }
}
