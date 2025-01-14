sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("com.resulto.control.controller.App", {
        onPressUsuario: function() {
			var oApp = this.byId("nestedApp");
			oApp.to(this.byId("usuarioView"));
		},
		
		onPressAdministrador: function() {
			var oApp = this.byId("nestedApp");
			oApp.to(this.byId("adminView"));
		}
    });
});