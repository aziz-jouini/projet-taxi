import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-proprietaire',
  templateUrl: './proprietaire.component.html',
  styleUrls: ['./proprietaire.component.scss']
})
export class ProprietaireComponent {
  taxis: any[] = [];
  isPopupOpen = false;
  isPurchasedTaxisPopupOpen = false;
  selectedTaxiId: number | null = null;
  proprietaireId: number | null = null;
  purchasedTaxis: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getTaxis();
  }

  getTaxis(): void {
    this.apiService.getTaxis().subscribe(
      (response) => {
        this.taxis = response;
      },
      (error) => {
        console.error('Erreur lors de la récupération des taxis:', error);
      }
    );
  }

  openPopup(taxiId: number): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.proprietaireId = decodedToken.id;
        this.selectedTaxiId = taxiId;
        this.isPopupOpen = true;
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
      }
    } else {
      console.error('Token non trouvé dans le local storage.');
    }
  }

  closePopup(): void {
    this.isPopupOpen = false;
  }

  confirmPurchase(): void {
    if (this.proprietaireId && this.selectedTaxiId) {
      this.apiService.acheterTaxi(this.proprietaireId, this.selectedTaxiId).subscribe(
        (response) => {
          console.log('Taxi acheté avec succès:', response);
          this.getTaxis();
          this.closePopup();
          this.openPurchasedTaxisPopup();
        },
        (error) => {
          console.error('Erreur lors de l\'achat du taxi:', error);
          this.closePopup();
        }
      );
    } else {
      console.error('Les ID du propriétaire ou du taxi sont manquants.');
    }
  }

  openPurchasedTaxisPopup(): void {
    this.apiService.getPurchasedTaxis().subscribe(
      (response) => {
        this.purchasedTaxis = response;
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

  // New methods for reservation handling
  
}
