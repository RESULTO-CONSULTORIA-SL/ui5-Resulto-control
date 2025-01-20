sap.ui.define([], function () {
    "use strict";

    return {
        isButtonVisible: function (currentState, buttonId) {
            if (!currentState) {
                // Recupera currentState directamente desde el modelo si no se pasa
                currentState = this.getView().getModel("visibilityRules").getProperty("/currentState");
            }
            const visibilityRules = this.getView().getModel("visibilityRules").getData();
            const rules = visibilityRules[currentState] || visibilityRules.DEFAULT;
            return rules[buttonId] || false;
        }
    };
});
