import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  user = {
    firstName: '',
    lastName: '',
    derniere_connexion: '',
    role: '',
  };
  purchasedTaxis: any[] = [];
  isPurchasedTaxisPopupOpen = false;
  reservations: any[] = [];
  isReservationsPopupOpen = false;
  taxiReservations: any[] = [];
  isTaxiReservationsPopupOpen = false;
  
  constructor(
    private userService: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.getUserProfile();
  }

  getUserProfile(): void {
    this.userService.getUserProfile().subscribe(
      (data) => {
        this.user = {
          firstName: data.prenom,
          lastName: data.nom,
          derniere_connexion: data.derniere_connexion,
          role: data.type,
        };
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
      }
    );
  }

  openPurchasedTaxisPopup(): void {
    this.apiService.getPurchasedTaxis().subscribe(
      (response) => {
        this.purchasedTaxis = Array.isArray(response) ? response : [response];
        this.isPurchasedTaxisPopupOpen = true;
      },
      (error) => {
        console.error('Erreur lors de la récupération des taxis achetés:', error);
      }
    );
  }

  closePurchasedTaxisPopup(): void {
    this.isPurchasedTaxisPopupOpen = false;
  }

  reserveTaxi(taxiId: number): void {
    this.apiService.reserveTaxi(taxiId).subscribe(
      () => {
        const taxi = this.purchasedTaxis.find((t) => t.id === taxiId);
        if (taxi) taxi.reserved = true;
      },
      (error) => {
        console.error('Erreur lors de la réservation du taxi:', error);
      }
    );
  }

  cancelReservation(taxiId: number): void {
    this.apiService.cancelReservation(taxiId).subscribe(
      () => {
        const taxi = this.purchasedTaxis.find((t) => t.id === taxiId);
        if (taxi) taxi.reserved = false;
      },
      (error) => {
        console.error('Erreur lors de l\'annulation de la réservation:', error);
      }
    );
  }

  logout(): void {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  openReservationsPopup(): void {
    this.getReservations();
    this.isReservationsPopupOpen = true;
  }

  closeReservationsPopup(): void {
    this.isReservationsPopupOpen = false;
  }
  
  getReservations(): void {
    this.apiService.getUserReservations().subscribe(
      (response) => {
        console.log('Réponse API:', response); // Vérifiez la réponse
        if (response && response.reservations && Array.isArray(response.reservations)) {
          this.reservations = response.reservations; // Accéder à la propriété
          console.log('Réservations récupérées:', this.reservations); // Vérifiez le contenu des réservations
        } else {
          this.reservations = []; // Si pas de réservations, assignez un tableau vide
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des réservations:', error);
        this.reservations = []; // Assurez-vous que le tableau est vide en cas d'erreur
      }
    );
  }
  getDateFromTime(timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return date;
  }
    // Méthode pour voir les réservations d'un taxi spécifique
  viewReservationsByTaxi(taxiId: number): void {
    this.apiService.getReservationsByTaxi(taxiId).subscribe(
      (response) => {
        this.taxiReservations = response.reservations;
        this.isTaxiReservationsPopupOpen = true;
      },
      (error) => {
        console.error('Erreur lors de la récupération des réservations par taxi:', error);
        this.taxiReservations = [];
      }
    );
  }

  closeTaxiReservationsPopup(): void {
    this.isTaxiReservationsPopupOpen = false;
  }
  
}
