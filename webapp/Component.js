sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("com.resulto.control.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // Llama al método init del UIComponent base
            UIComponent.prototype.init.apply(this, arguments);

            // Crear datos iniciales para el modelo
            var oData = {
                records: [] // Array vacío para almacenar registros
            };

            // Crear el modelo JSON
            var oModel = new JSONModel(oData);

            // Establecer el modelo global
            this.setModel(oModel);

        }
    });
});
