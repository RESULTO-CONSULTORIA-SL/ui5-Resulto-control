sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"  
], function (Controller, JSONModel, Filter, FilterOperator) {
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
                    { name: "Juan Pérez", month: "Enero", date: "2025-01-01", startTime: "08:00", endTime: "16:00", hours: 8 },
                    { name: "Juan Pérez", month: "Marzo", date: "2025-03-01", startTime: "08:30", endTime: "15:30", hours: 7 },
                    { name: "María López", month: "Febrero", date: "2025-02-01", startTime: "09:00", endTime: "17:00", hours: 8 },
                    { name: "Carlos Ruiz", month: "Marzo", date: "2025-03-01", startTime: "10:00", endTime: "18:00", hours: 8 }
                ]
            };

            // Crear el modelo JSON
            var oModel = new JSONModel(oData);
            // Asignar el modelo a la vista
            this.getView().setModel(oModel);
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
        }
        
        
    });
});
