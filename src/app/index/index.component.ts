import { Component, ViewChild } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DisplayUserChartComponent } from '../reports-files/display-user-chart/display-user-chart.component';


@Component({
  selector: 'app-index',
  standalone: true,
  imports: [MatCardModule,DisplayUserChartComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent {

  cardData: any;


  ngOnInit() {
    
    this.loadData();
  }






  async cardRecover(){
    try {
      const response = await fetch(
        "http://localhost/iso2sys_rest_api/server.php?dashboard_cards="  
      );
      if (!response.ok) {
        throw new Error("Error en la solicitud: " + response.status);
      }
      const data = await response.json();
      console.log("Datos recibidos:", data);
      return data; // Devuelve los datos
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }


  
async loadData() {

  this.cardData = await this.cardRecover();

  console.log('CardData:', this.cardRecover); // Verifica el contenido de cardata



}


}
