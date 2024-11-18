import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BaseChartDirective } from 'ng2-charts';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CategoryScale, Chart,BarController, BarElement, LinearScale, Title, Tooltip, Legend, ChartConfiguration, ChartEvent, ChartData } from 'chart.js'; 

@Component({
  selector: 'app-display-user-chart',
  standalone: true,
  imports: [ FormsModule,CommonModule, MatButton, BaseChartDirective], // Importa HttpClientModule aquí],
  templateUrl: './display-user-chart.component.html',
  styleUrl: './display-user-chart.component.css'
})
export class DisplayUserChartComponent {

  @Input() reportList: any;
  
  @ViewChild(BaseChartDirective) chart: BaseChartDirective<'bar'> | undefined;

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    scales: {
      x: {},
      y: {
        min: 0,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  public barChartType = 'bar' as const;

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], 
        backgroundColor: ['red','#42A5F5'], // Cambia este color a tu preferencia
        label: 'Usuarios Registrados' },
    ],
  };

  async ngOnInit() {
    this.reportList = await this.loadUserData();
  }

  async loadUserData(): Promise<any> {
    try {
      const response = await fetch('http://localhost/iso2sys_rest_api/server.php?getUsersByMonth');
      if (!response.ok) {
        throw new Error("Error en la solicitud: " + response.status);
      }
      const data = await response.json();
      console.log("Datos recibidos:", data);
      
      // Actualiza el gráfico con los datos recibidos
      this.updateChartData(data);
      return data;
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }

  updateChartData(reportList: any[]): void {
    const labels = reportList.map(item => item.month_name);
    const data = reportList.map(item => item.user_count);
    const backgroundColor = reportList.map((_, index) => index % 2 === 0 ? '#f47e368c' : '#66ed3c40'); // Azul y verde
    this.barChartData = {
      labels,
      datasets: [
        { data, label: 'Usuarios Registrados',backgroundColor},
      ],
    };
    this.chart?.update();
  }

  public chartClicked({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }

  public chartHovered({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }

  public randomize(): void {
    // Genera valores aleatorios para probar
    const newData = this.barChartData.datasets[0].data.map(() => Math.round(Math.random() * 100));
    this.barChartData.datasets[0].data = newData;

    this.chart?.update();
  }
  
}


