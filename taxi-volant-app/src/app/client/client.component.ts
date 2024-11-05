import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { ApiService } from '../api.service';
import { WeatherService } from '../weather.service';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { ModelService } from '../model.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  smallMap: L.Map | null = null;
  marker!: L.Marker;
  availableTaxis: any[] = [];
  isLoading: boolean = true;
  showReservationModal: boolean = false;
  selectedTaxi: string = '';
  pickupLocation: string = '';
  destination: string = '';
  userLocation: { lat: number; lng: number } | null = null;
  weatherData: any;
  routeDetails: string = '';
  travelCost: number | null = null;
  private routeControl: L.Routing.Control | null = null;
  private geoCache: Map<string, { lat: number; lng: number }> = new Map();
  costPer100m = 0.5;
  lastReservationTimestamp: Date | null = null;
  lastTravelTime: number | null = null;

  constructor(
    private apiService: ApiService,
    private weatherService: WeatherService,
    private http: HttpClient,
    private modelService: ModelService
  ) {}

  ngOnInit(): void {
    this.fetchAvailableTaxis();
  }

  fetchAvailableTaxis(): void {
    this.apiService.getAvailableTaxis().subscribe({
      next: (data) => {
        this.availableTaxis = data.map(taxi => ({
          id: taxi.id,
          proprietaire_id: taxi.proprietaire_id,
          en_reservation: taxi.en_reservation,
          proprietaire_nom: taxi.proprietaire_nom,
          proprietaire_prenom: taxi.proprietaire_prenom,
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching available taxis:', error);
        this.isLoading = false;
      }
    });
  }

  openReservationModal(): void {
    // Check if a previous reservation is still active
    if (this.isReservationActive()) {
      alert('Vous ne pouvez pas faire une nouvelle réservation tant que la précédente n\'est pas terminée.');
      return;
    }

    this.showReservationModal = true;
    this.getUserLocation();
  }

  closeReservationModal(): void {
    this.showReservationModal = false;
    if (this.smallMap) {
      this.smallMap.remove();
      this.smallMap = null;
    }
    this.routeDetails = '';
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.pickupLocation = `${this.userLocation.lat}, ${this.userLocation.lng}`;
          this.fetchWeatherData(this.userLocation.lat, this.userLocation.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve your location. Please check your settings.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  fetchWeatherData(lat: number, lng: number): void {
    this.weatherService.getWeather(lat, lng).subscribe({
      next: (data) => {
        if (data.current && data.current.condition) {
          this.weatherData = {
            temperature: data.current.temp_c ?? 'N/A',
            description: data.current.condition.text ?? 'No description available',
            icon: data.current.condition.icon ? `https:${data.current.condition.icon}` : ''
          };
        } else {
          console.warn('Unexpected weather data format:', data);
          this.weatherData = {
            temperature: 'N/A',
            description: 'Weather data unavailable',
            icon: ''
          };
        }
        this.initSmallMap();
      },
      error: (error) => {
        console.error('Error fetching weather data:', error);
      }
    });
  }

  initSmallMap(): void {
    if (!this.smallMap) {
      this.smallMap = L.map('small-map', { zoomControl: false }).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.smallMap);
    }

    if (this.userLocation) {
      this.smallMap.setView([this.userLocation.lat, this.userLocation.lng], 13);
      this.addMarkerToMap(this.userLocation.lat, this.userLocation.lng);
    }
  }

  addMarkerToMap(lat: number, lng: number): void {
    if (this.marker) {
      this.smallMap?.removeLayer(this.marker);
    }

    const userIcon = L.icon({
      iconUrl: 'assets/location-icon.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    if (this.smallMap) {
      this.marker = L.marker([lat, lng], { icon: userIcon }).addTo(this.smallMap);
      this.marker.bindPopup('Votre position actuelle').openPopup();
      this.smallMap.setView([lat, lng], 13);
    }
  }

  detectLanguage(): string {
    const userLang = navigator.language || 'fr';
    return userLang.startsWith('ar') ? 'ar' : 'fr';
  }

  async geocodeAddress(address: string, lang: string = 'fr'): Promise<{ lat: number; lng: number }> {
    if (this.geoCache.has(address)) {
      return this.geoCache.get(address)!;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&accept-language=${lang}`;

    try {
      const results = await this.http.get<any[]>(url).toPromise();
      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        const coordinates = { lat: parseFloat(lat), lng: parseFloat(lon) };
        this.geoCache.set(address, coordinates);
        return coordinates;
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('Error fetching coordinates from Nominatim:', error);
      throw new Error('Unable to retrieve coordinates for the destination address.');
    }
  }

  isReservationActive(): boolean {
    if (this.lastReservationTimestamp && this.lastTravelTime !== null) {
      const reservationEndTime = new Date(this.lastReservationTimestamp.getTime() + this.lastTravelTime * 60000);
      return new Date() < reservationEndTime;
    }
    return false;
  }

  submitReservation(): void {
    if (this.isReservationActive()) {
      alert('Vous ne pouvez pas faire une nouvelle réservation tant que la précédente n\'est pas terminée.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Veuillez vous connecter pour passer une réservation.');
        return;
    }

    try {
        const decodedToken: any = jwtDecode(token);

        this.geocodeAddress(this.destination, this.detectLanguage())
            .then(async destinationCoords => {
                const distance = this.calculateDistance(this.userLocation!, destinationCoords);
                const { travelTime, arrivalTime } = this.calculateTravelTime(distance);
                const departureTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const travelCost = this.calculateCost(distance * 1000);

                const selectedTaxi = this.availableTaxis.find(taxi => taxi.id === this.selectedTaxi);
                const proprietaire_id = selectedTaxi ? selectedTaxi.proprietaire_id : null;

                // Check if selectedTaxi is null or proprietaire_id is still null
                if (!selectedTaxi || proprietaire_id === null) {
                    alert('Veuillez sélectionner un taxi valide.');
                    return;
                }

                const reservationData = {
                    user_id: decodedToken.id,
                    taxi_id: selectedTaxi.id,
                    proprietaire_id: proprietaire_id,
                    userLocation: `${this.userLocation?.lat}, ${this.userLocation?.lng}`,
                    destination: this.destination,
                    distance: parseFloat(distance.toFixed(2)),
                    travelTime: travelTime,
                    departureTime: departureTime,
                    arrivalTime: arrivalTime,
                    travelCost: parseFloat(travelCost.toFixed(2)),
                    weather: {
                        temperature: this.weatherData?.temperature,
                        description: this.weatherData?.description
                    },
                    status: 'pending'
                };

                console.log('Submitting reservation with data:', reservationData);

                // Call the reservation API
                this.apiService.reserveTaxiDetails(reservationData)
                    .subscribe({
                        next: (response) => {
                            alert('Réservation réussie!');
                            this.lastReservationTimestamp = new Date();
                            this.lastTravelTime = travelTime; // Store the travel time in minutes
                            this.closeReservationModal();
                        },
                        error: (error) => {
                            console.error('Error submitting reservation:', error);
                            alert('Erreur lors de la soumission de la réservation. Veuillez réessayer.');
                        }
                    });
            })
            .catch(error => {
                console.error('Error geocoding address:', error);
                alert('Erreur lors de la géocodage de l\'adresse de destination.');
            });
    } catch (error) {
        console.error('Error decoding token:', error);
        alert('Erreur lors de la soumission de la réservation. Veuillez réessayer.');
    }
  }

  calculateDistance(userLocation: { lat: number; lng: number }, destinationCoords: { lat: number; lng: number }): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(destinationCoords.lat - userLocation.lat);
    const dLon = this.deg2rad(destinationCoords.lng - userLocation.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.deg2rad(userLocation.lat)) * Math.cos(this.deg2rad(destinationCoords.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  calculateTravelTime(distance: number): { travelTime: number, arrivalTime: string } {
    const averageSpeed = 40; // km/h
    const travelTime = distance / averageSpeed; // Time in hours
    const travelTimeInMinutes = travelTime * 60; // Convert to minutes
    const arrivalTime = new Date(new Date().getTime() + travelTime * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return { travelTime: travelTimeInMinutes, arrivalTime: arrivalTime };
  }

  calculateCost(distance: number): number {
    return (distance / 100) * this.costPer100m;
  }
}
