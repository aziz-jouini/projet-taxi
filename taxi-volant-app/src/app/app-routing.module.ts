import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { AdminComponent } from './admin/admin.component';
import { ClientComponent } from './client/client.component';
import { ProprietaireComponent } from './proprietaire/proprietaire.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', component: LoginComponent },  // Page d'accueil par défaut
  { path: 'inscription', component: InscriptionComponent }, // Page d'inscription
  { path: 'admin', component: AdminComponent },
  { path: 'client', component: ClientComponent },
  { path: 'proprietaire', component: ProprietaireComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }, 
  
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
