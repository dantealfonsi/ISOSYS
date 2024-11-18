import { Component, ViewChild,OnInit} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'


interface History {
  action: string;  
  date: string;
}

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [MatPaginatorModule,MatTableModule,MatSortModule],
  templateUrl: './user-history.component.html',
  styleUrl: './user-history.component.css'
})
export class UserHistoryComponent {

  
  historyData: any;
  historyDataMat = new MatTableDataSource<any>();


  constructor(private _formBuilder: FormBuilder) {}

  @ViewChild(MatPaginator) paginator! : MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  async ngOnInit() {
    this.historyData = await this.historyDataList();
    this.historyDataMat.data = this.historyData;
    this.historyDataMat.paginator = this.paginator;
    this.historyDataMat.sort = this.sort;
  }

  async historyDataList() {
    try {
      const response = await fetch('http://localhost/iso2sys_rest_api/server.php?history_data');
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
    // Paso 1: Obtener el valor del local storage
  
    // Asegúrate de que this_user_recover se complete antes de seguir
    this.historyData = await this.historyDataList();
    this.historyDataMat = new MatTableDataSource<History>(this.historyData);
  
    console.log('userData:', this.historyData); // Verifica el contenido de userData
    console.log('MarkData:', this.historyDataList); // Verifica el contenido de marklist
  
  }
  

  
applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.historyDataMat.filter = filterValue.trim().toLowerCase();
}


  downloadPdf() {
    const doc = new jsPDF();

    // Usar autoTable para generar la tabla basada en el contenido HTML
    autoTable(doc, {
      html: '#content',
      startY: 20,
      styles: {
        fontSize: 12,
        cellPadding: 3,
      },
      didDrawCell: (data) => {
        console.log(data.cell.raw); // Para depurar y verificar qué celdas se están dibujando
      }
    });

    // Añadir título al PDF
    doc.setFontSize(18);
    doc.text('Reportes', 14, 15);

    // Guardar el documento con nombre específico
    doc.save('reporte_historial.pdf');
  }

  firstLetterUpperCase(word: string): string {
  return word.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
  } 
  
  capitalizeWords(str : string) : string {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
 }
      
      
 
  
}

