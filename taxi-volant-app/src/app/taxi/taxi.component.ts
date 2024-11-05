import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-taxi',
  templateUrl: './taxi.component.html',
  styleUrls: ['./taxi.component.scss']
})
export class TaxiComponent implements OnInit {
  taxis: any[] = [];
  newTaxi = {
    nom: '',
    matricule: '',
    prix: 0,
    photo_de_taxi: null
  };
  selectedFile: File | null = null;
  isPopupOpen = false;
  isEditPopupOpen = false;
  isViewPopupOpen = false;
  editTaxi: any = {};
  viewTaxi: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getTaxis();
  }

  openPopup(): void {
    this.isPopupOpen = true;
  }

  closePopup(): void {
    this.isPopupOpen = false;
  }

  openEditPopup(taxi: any): void {
    this.editTaxi = { ...taxi };
    this.isEditPopupOpen = true;
  }

  closeEditPopup(): void {
    this.isEditPopupOpen = false;
  }

  openViewPopup(taxi: any): void {
    this.viewTaxi = taxi;
    this.isViewPopupOpen = true;
  }

  closeViewPopup(): void {
    this.isViewPopupOpen = false;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  addTaxi(): void {
    if (!this.newTaxi.nom || !this.newTaxi.matricule || this.newTaxi.prix <= 0) {
      console.error('Tous les champs sont requis et le prix doit être positif.');
      return;
    }

    const formData = new FormData();
    formData.append('nom', this.newTaxi.nom);
    formData.append('matricule', this.newTaxi.matricule);
    formData.append('prix', this.newTaxi.prix.toString());
    if (this.selectedFile) {
      formData.append('photo_de_taxi', this.selectedFile);
    }

    this.apiService.addTaxi(formData).subscribe(
      (response) => {
        console.log(response.message);
        this.resetForm();
        this.getTaxis();
        this.closePopup();
      },
      (error) => {
        console.error('Erreur lors de l’ajout du taxi:', error);
      }
    );
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

  deleteTaxi(id: number): void {
    this.apiService.deleteTaxi(id).subscribe(
      (response) => {
        console.log(response.message);
        this.getTaxis();
      },
      (error) => {
        console.error('Erreur lors de la suppression du taxi:', error);
      }
    );
  }

  updateTaxi(): void {
    if (!this.editTaxi.nom || !this.editTaxi.matricule || this.editTaxi.prix <= 0) {
      console.error('Tous les champs sont requis et le prix doit être positif.');
      return;
    }

    const formData = new FormData();
    formData.append('nom', this.editTaxi.nom);
    formData.append('matricule', this.editTaxi.matricule);
    formData.append('prix', this.editTaxi.prix.toString());
    if (this.selectedFile) {
      formData.append('photo_de_taxi', this.selectedFile);
    }

    this.apiService.updateTaxi(this.editTaxi.id, formData).subscribe(
      (response) => {
        console.log(response.message);
        this.getTaxis();
        this.closeEditPopup();
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du taxi:', error);
      }
    );
  }

  resetForm(): void {
    this.newTaxi = { nom: '', matricule: '', prix: 0, photo_de_taxi: null };
    this.selectedFile = null;
  }
}
