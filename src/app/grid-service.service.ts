import { Injectable } from '@angular/core';
import { timeout } from 'q';
import { HttpClient } from "@angular/common/http";
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GridServiceService {

  constructor(private http: HttpClient) { }

  getGridData(){
    return this.http.get("https://my-json-server.typicode.com/amarendar94/sample-API/employees")
  }

  // getGridConfig(){
  //   return of([
  //     { fieldName: "id", header: 'Id', hidden: true },
  //     { fieldName: "athlete", header: 'Athelete', hidden: false },
  //     { fieldName: "age", header: 'Age', hidden: false },
  //     { fieldName: "country", header: 'Country', hidden: true },
  //     { fieldName: "year", header: 'Year', hidden: false },
  //     { fieldName: "sport", header: 'Sport', hidden: false },
  //     { fieldName: "gold", header: 'Gold', hidden: false },
  //     { fieldName: "silver", header: 'Silver', hidden: false },
  //     { fieldName: "bronze", header: 'Bronze', hidden: false }
  //   ])
  // }
}
