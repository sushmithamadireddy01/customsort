import { Workbook } from 'exceljs';
import { GridServiceService } from './grid-service.service';
import { Component } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { AllCommunityModules, ValueFormatterService } from '@ag-grid-community/all-modules';
import { ExportService } from './_services/export.service';
import * as fs from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-agGrid-example';
  private gridApi;
  private gridColumnApi;
  public modules = AllCommunityModules;
  private columnDefs;
  private rowData;
  private defaultColDef;
  private rowClassRules;
  private postSort;
  private ascOrder = false;
  private sortModel = [];
  private specialrows = {};
  constructor(private gridService: GridServiceService,
    private dateFormatter: DatePipe,
    private exportService: ExportService,
    private numberFormatter: DecimalPipe) {
    this.rowClassRules = {
      "sick-days-warning": function (params) {
        return params.data[params.columnApi.getAllGridColumns()[0].colId] === "224250";
      },
    };
    this.postSort = (rowNodes) => {
      let sortModel = rowNodes[0].gridApi.getSortModel()[0];
      if (rowNodes.length && rowNodes[0].gridApi.getSortModel().length &&
        (!this.sortModel.length || (this.sortModel[0].colId != sortModel.colId || this.sortModel[0].sort != sortModel.sort))) {
        let sortcolumn = sortModel.colId;
        this.ascOrder = !this.ascOrder;
        rowNodes.forEach((row, index) => {
          if ((row.columnApi.getAllGridColumns() && row.data[row.columnApi.getAllGridColumns()[1].colId] === "snehal") ||
            (row.columnApi.getAllGridColumns() && row.data[row.columnApi.getAllGridColumns()[1].colId] === "test2")) {
            this.specialrows[index] = row;
          }
        });
        rowNodes = Object.keys(this.specialrows).reduce((acc, curr, i) => {
          console.log(acc, curr, i)
          acc = [...acc, ...rowNodes.slice(acc.length, parseInt(curr)).sort((r1, r2) => {
            return this.ascOrder ? r1.data[sortcolumn].localeCompare(r2.data[sortcolumn]) : r2.data[sortcolumn].localeCompare(r1.data[sortcolumn])
          }),
          this.specialrows[parseInt(curr)],
          ...i === (Object.keys(this.specialrows).length - 1) ? rowNodes.slice(parseInt(curr) + 1).sort((r1, r2) => {
            return this.ascOrder ? r1.data[sortcolumn].localeCompare(r2.data[sortcolumn]) : r2.data[sortcolumn].localeCompare(r1.data[sortcolumn])
          }) : rowNodes.slice(parseInt(curr) + 1, parseInt(curr)).sort((r1, r2) => {
            return this.ascOrder ? r1.data[sortcolumn].localeCompare(r2.data[sortcolumn]) : r2.data[sortcolumn].localeCompare(r1.data[sortcolumn])
          })
          ]
          return acc;
        }, []);
        //this.gridApi.setSortModel(null);
        this.sortModel = [...this.gridApi.getSortModel()]
        this.gridApi.setRowData(rowNodes.map((r) => {
          return r.data;
        }))
        // this.gridApi.setSortModel(sortModel);
      }
    }
  }

  onGridReady(params) {
    this.defaultColDef = {
      sortable: true,
      comparator: (...args) => {
        return 0;
      }
    }
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridService.getGridData().subscribe((data: any) => {
      if (data && data.length) {
        this.columnDefs = [...Object.entries(data[0]).map(
          (x: any) => {
            return {
              headerName: x[0].toUpperCase(),
              field: x[0],
              cellRenderer: customcellRenderer,
              ... !isNaN(x[1]) && {
                valueFormatter: (data) => this.numberFormatter.transform(data.value, '1.2-2'),
                cellClass: "rawValue",
              }
            }
          }
        )]
        this.rowData = data;
      } else {
        this.columnDefs = []
        this.rowData = []
      }
    })
  }
  onFirstDataRendered(params) {
    if (params.columnApi.getAllGridColumns().length > 7) {
      params.api.autosizecolumns();
    } else {
      params.api.sizeColumnsToFit()
    }
  }

  export() {
    var workbook = new Workbook();
    var worksheet = workbook.addWorksheet('My Sheet');
    worksheet.columns = this.columnDefs.map((x: any) => ({
      header: x.headerName,
      key: x.field,
      ...x.field === 'date' && { width: 15, style: { numFmt: 'MM-dd-yyyy' } },
      ...x.field === 'id' && { width: 15, style: { numFmt: '#,##0.00' } }
    }))
    console.log(worksheet.columns)
    worksheet.addRows(this.rowData.slice(0, 20).map(x => {
      return {
        ...x,
        date: new Date("2019-12-22T18:25:00-05:00")
      }
    }))
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'CarData.xlsx');
    });
    this.exportService.exportExcel(this.rowData, 'customers');
  }
}

function customcellRenderer(params) {
  if ((params.data[params.columnApi.getAllGridColumns()[0].colId] === "224246" &&
    !(params.colDef.headerName === params.columnApi.getAllGridColumns()[0].colDef.headerName)) ||
    (params.data[params.columnApi.getAllGridColumns()[0].colId] === "224234" &&
      (params.colDef.headerName === params.columnApi.getAllGridColumns()[1].colDef.headerName))) {
    return '';
  }
  return params.valueFormatted ? params.valueFormatted : params.value
}

