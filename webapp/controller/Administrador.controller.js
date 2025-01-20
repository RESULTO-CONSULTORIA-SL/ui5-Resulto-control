sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/Input",
    "sap/m/DatePicker",
    "sap/m/TimePicker" 
], function (Controller, JSONModel, Filter, FilterOperator,
     DateFormat, ColumnListItem, Text, Input, DatePicker, TimePicker) {
    "use strict";

    return Controller.extend("com.resulto.control.controller.Administrador", {
        onInit: function () {
            // Datos simulados
            var oData = {
                Usuarios: [
                    { key: "1", name: "Juan Pérez" },
                    { key: "2", name: "María López" },
                    { key: "3", name: "Carlos Ruiz" }
                ],
                Mes: [
                    { key: "01", month: "Enero" },
                    { key: "02", month: "Febrero" },
                    { key: "03", month: "Marzo" }
                ],
                Items: [
                    { name: "Juan Pérez", month: "Enero", date: "2025-01-01", startTime: "08:00", endTime: "16:00", hours: 8 , totalHours: ""},
                    { name: "Juan Pérez", month: "Marzo", date: "2025-03-01", startTime: "08:30", endTime: "15:30", hours: 7 , totalHours: ""},
                    { name: "María López", month: "Febrero", date: "2025-02-01", startTime: "09:00", endTime: "17:00", hours: 8 , totalHours: ""},
                    { name: "Carlos Ruiz", month: "Marzo", date: "2025-03-01", startTime: "10:00", endTime: "18:00", hours: 8 , totalHours: ""}
                ]
            };
            // Crear el modelo JSON
            var oModel = new JSONModel(oData);
            // Asignar el modelo a la vista
            this.getView().setModel(oModel);
            this.oTable = this.byId("table");
            this.oReadOnlyTemplate= new ColumnListItem({
                cells:[
                    new Text ({ text: "{name}" }),
                    new Text ({ text: "{month}"}),
                    new Text ({ text: "{date}"}),
                    new Text ({ text: "{startTime}"}),
                    new Text ({ text: "{endTime}"}),
                    new Text ({ text: "{hours}"}),
                    new Text ({ text: "{totalHours}"})

                ]
            });
            this.oEditableTemplate = new ColumnListItem({
                cells: [
                    new Input({ value: "{name}"}),
                    new Input({ value: "{date}"}),
                    new DatePicker({ value: "{date}",
                      displayFormat: "dd/MM/yyyy",
                      valueFormat: "yyyy-MM-dd"
                    }),
                    new TimePicker({ value:"{startTime}"
                    }),
                    new TimePicker({ value:"{endTime}"
                    }),
                    new Input({ value:"{hours}"
                    }),
                    new Input({ value:"{totalHours}"
                     }),
                   
                ]
            });
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");
        },
        rebindTable: function (oTemplate, sKeyboardMode) {
            this.oTable.bindItems({
                path: "/Items",
                template: oTemplate,
                templateShareable: true
            });
        },
        onSearch: function (oEvent) {
            // Obtener los valores del SearchField
            var sQueryNombre = this.getView().byId("searchNombre").getValue();
            var sQueryMes = this.getView().byId("searchMes").getValue();
            // Crear un array de filtros
            var aFilters = [];
            // Agregar filtro para el nombre
            if (sQueryNombre) {
                aFilters.push(new Filter("name", FilterOperator.Contains, sQueryNombre));
            }
            // Agregar filtro para el mes
            if (sQueryMes) {
                aFilters.push(new Filter("month", FilterOperator.Contains, sQueryMes));
            }
            // Obtener la tabla y su binding de elementos
            var oTable = this.getView().byId("table");
            var oBinding = oTable.getBinding("items");
            // Aplicar los filtros
            oBinding.filter(aFilters);
        },
        onEditTable: function(){
            this.aBackupData = JSON.parse(JSON.stringify(this.getView().getModel().getProperty("/Items")));
            this.rebindTable(this.oEditableTemplate, "Edit");
        },
        onSaveChange: function () {
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");
            var oModel = this.getView().getModel();
            var oData = oModel.getData();
            oModel.setData(oData);
        },
        onCancelChange: function () {
            this.getView().getModel().setProperty("/Items", this.aBackupData);
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");
        },
    });
});
