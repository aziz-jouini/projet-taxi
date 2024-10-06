import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; // Assurez-vous que le chemin est correct

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss']
})
export class InscriptionComponent {
  user = {
    prenom: '',
    nom: '',
    email: '',
    mot_de_passe: '',
    confirmPassword: '', // Champ de confirmation de mot de passe
    type: 'client' // Valeur par défaut, en minuscule
  };

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit() {
    if (this.user.mot_de_passe !== this.user.confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return; // Ne pas envoyer la requête si les mots de passe ne correspondent pas
    }

    // Créer un nouvel objet sans le champ confirmPassword
    const { confirmPassword, ...userData } = this.user;

    // Vérifiez ce qui sera envoyé
    console.log('Données envoyées à l\'API :', userData);

    // Envoyer les données d'inscription à l'API
    this.apiService.register(userData).subscribe(
      response => {
        console.log('Inscription réussie', response);
        alert('Inscription réussie ! Vous pouvez vous connecter maintenant.'); // Notification de succès
        this.router.navigate(['/login']); // Rediriger vers la page de connexion
      },
      error => {
        console.error('Erreur lors de l\'inscription', error);
        alert('Une erreur est survenue lors de l\'inscription. Détails: ' + error.error.message);
      }
    );
  }
}
