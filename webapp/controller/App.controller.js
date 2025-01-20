sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("com.resulto.control.controller.App", {
        onPressUsuario: function() {
			var oApp = this.byId("nestedApp");
			oApp.to(this.byId("usuarioView"));
		},
		onPressAdministrador: function() {
			var oApp = this.byId("nestedApp");
			oApp.to(this.byId("adminView"));
		},
		onSave: function() {
			//Lógica para guardar los datos
			MessageToast.show("Datos Guardados");
		},
		onCancel: function() {
			//Lógica para cancelar
			MessageToast.show("Datos Cancelados");
		},
		onPressProfile: function () {
		  MessageToast.show("Avatar presionado");
		}
    });
});