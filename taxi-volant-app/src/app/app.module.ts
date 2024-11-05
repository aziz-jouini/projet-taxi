import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ClientComponent } from './client/client.component';
import { AdminComponent } from './admin/admin.component';
import { ProprietaireComponent } from './proprietaire/proprietaire.component';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ProfileComponent } from './profile/profile.component';
import { NavbarComponent } from './navbar/navbar.component';
import { UtilisateursComponent } from './utilisateurs/utilisateurs.component';
import { TaxiComponent } from './taxi/taxi.component';
import { ListTaxisComponent } from './list-taxis/list-taxis.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    InscriptionComponent,
    ClientComponent,
    AdminComponent,
    ProprietaireComponent,
    SidebarComponent,
    ProfileComponent,
    NavbarComponent,
    UtilisateursComponent,
    TaxiComponent,
    ListTaxisComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    SocialLoginModule,
    
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false, // facultatif, s'authentifier automatiquement si l'utilisateur est déjà connecté
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '55995467395-tg1hap97hsd98v35nb2t054cd4aseju6.apps.googleusercontent.com'
            )
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
