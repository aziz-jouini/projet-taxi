import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  mot_de_passe = '';
  user: SocialUser | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: SocialAuthService
  ) {}

  ngOnInit(): void {
    // Vérifier l'état d'authentification Google
    this.authService.authState.subscribe((user) => {
      this.user = user;
      if (this.user) {
        // Envoyer le token Google au backend pour vérification
        this.apiService.verifyGoogleUser(this.user).subscribe(
          (response) => {
            // Rediriger l'utilisateur selon son type
            if (response.userType === 'admin') {
              this.router.navigate(['/admin']);
            } else if (response.userType === 'client') {
              this.router.navigate(['/client']);
            } else if (response.userType === 'proprietaire') {
              this.router.navigate(['/proprietaire']);
            }
          },
          (error) => {
            console.error('Erreur lors de la connexion avec Google', error);
            alert('Erreur lors de la connexion avec Google.');
          }
        );
      }
    });
  }

  // Fonction pour se connecter avec email et mot de passe
  onSubmit() {
    const credentials = {
      email: this.email,
      mot_de_passe: this.mot_de_passe
    };

    this.apiService.login(credentials).subscribe(
      response => {
        console.log('Connexion réussie', response);
        const token = response.token;

        // Stocker le token dans le localStorage
        localStorage.setItem('token', token);

        // Décoder le token pour obtenir les informations de l'utilisateur
        const decodedToken = this.decodeToken(token);
        const userType = decodedToken.type;

        // Rediriger l'utilisateur en fonction de son type
        if (userType === 'admin') {
          this.router.navigate(['/admin']);
        } else if (userType === 'client') {
          this.router.navigate(['/client']);
        } else if (userType === 'proprietaire') {
          this.router.navigate(['/proprietaire']);
        }
      },
      error => {
        console.error('Erreur lors de la connexion', error);
        alert('Erreur lors de la connexion. Veuillez vérifier vos identifiants.');
      }
    );
  }

  // Méthode pour se connecter avec Google
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  // Fonction pour décoder un token JWT
  decodeToken(token: string) {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
}
