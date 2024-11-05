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
  forgotEmail = '';
  newPassword = '';
  isModalOpen = false;
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
        this.apiService.verifyGoogleUser(this.user).subscribe(
          (response) => {
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

  onSubmit() {
    const credentials = {
      email: this.email,
      mot_de_passe: this.mot_de_passe
    };

    this.apiService.login(credentials).subscribe(
      response => {
        console.log('Connexion réussie', response);
        const token = response.token;

        localStorage.setItem('token', token);
        const decodedToken = this.decodeToken(token);
        const userType = decodedToken.type;

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

  openForgotPasswordModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.forgotEmail = '';
    this.newPassword = '';
  }

  resetPassword() {
    if (!this.forgotEmail || !this.newPassword) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const resetData = {
      email: this.forgotEmail,
      newPassword: this.newPassword
    };

    this.apiService.resetPassword(resetData).subscribe(
      response => {
        alert('Mot de passe réinitialisé avec succès.');
        this.closeModal();
      },
      error => {
        console.error('Erreur lors de la réinitialisation du mot de passe', error);
        alert('Erreur lors de la réinitialisation du mot de passe.');
      }
    );
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  decodeToken(token: string) {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
}
