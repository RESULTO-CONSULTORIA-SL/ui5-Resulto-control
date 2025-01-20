sap.ui.define([
	"sap/ui/model/json/JSONModel",
], function(
	JSONModel
) {
	"use strict";

	return {
		createVisibilityModel: function() {
			const visibilityRules = {
				currentState :"DEFAULT",
				STARTED: {
					idStart: false,
					idPause: true,
					idFinish: true,
					editButton: false,
					saveButton: false,
					cancelButton: false,
					addButton: false,
					Acciones: false

				},
				PAUSED: {
					idStart: true,
					idPause: false,
					idFinish: true,
					editButton: true,
					saveButton: false,
					cancelButton: false,
					addButton: false,
					Acciones: false
				},
				FINISHED: {
					idStart: true,
					idPause: false,
					idFinish: false,
					editButton: false,
					saveButton: false,
					cancelButton: false,
					addButton: false,
					Acciones: false
				},
				DEFAULT: {
					idStart: true,
					idPause: true,
					idFinish: true,
					editButton: true,
					saveButton: false,
					cancelButton: false,
					addButton: false,
					Acciones: false
				},
				SAVED: {
					idStart: true,
					idPause: false,
					idFinish: true,
					editButton: true,
					saveButton: false,
					cancelButton: false,
					addButton: false,
					Acciones: false
				},
				EDITED: {
					idStart: true,
					idPause: false,
					idFinish: true,
					editButton: false,
					saveButton: true,
					cancelButton: true,
					addButton: true,
					Acciones: true
				},
				CANCELED: {
					idStart: true,
					idPause: false,
					idFinish: true,
					editButton: true,
					saveButton: false,
					cancelButton: false,
					addButton: false,
					Acciones: false
				}
                
			};
			// Crear el modelo basado en visibilityRules
			const visibilityModel = new JSONModel(visibilityRules);
			return visibilityModel;
		}
	};
});
