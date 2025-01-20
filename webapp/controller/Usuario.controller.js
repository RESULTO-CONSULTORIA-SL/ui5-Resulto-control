sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/Input",
    "sap/m/DatePicker",
    "sap/m/TimePicker",
    "sap/m/Button",
    "sap/m/Dialog",
    "com/resulto/control/model/formatter",
    "com/resulto/control/model/models"
  ],
  function (Controller,
	JSONModel,
	DateFormat,
	ColumnListItem,
	Text,
	Input,
	DatePicker,
	TimePicker,
	Button,
	Dialog,
	formatter,
  models
 )
   {
    "use strict";

    return Controller.extend("com.resulto.control.controller.Usuario", {
      timer: null,
      startTime: null,
      elapsedTime: 0,
      isRunning: false,
      formatter: formatter,

      onInit: function () {
        const visibilityModel = models.createVisibilityModel();
        this.getView().setModel(visibilityModel, "visibilityRules");
        
        this.visibilityModel = visibilityModel;
        visibilityModel.setProperty("/currentState", "DEFAULT");
        
        let oDate = new Date();
        let oFormat = DateFormat.getInstance({
          pattern: "EEEE, dd/MM/yyyy, HH:mm:ss",
        });
        let sFormattedDate = oFormat.format(oDate);
        // Crear el modelo inicial con datos vacíos y botones habilitados
        let oModel = new JSONModel({
          workData: [],
          date: sFormattedDate,
          time: "00:00:00", 
        });
        
        this.getView().setModel(oModel);
        this.oTable = this.byId("workTable");
        this.oReadOnlyTemplate = new ColumnListItem({
            cells: [
                new Text({ text: "{date}" }),
                new Text({ text: "{startTime}" }),
                new Text({ text: "{endTime}" }),
                new Text({ text: "{hours}" }),
                new Text({ text: "{totalHours}" })
            ]
        });
        this.oEditableTemplate = new ColumnListItem({
            cells: [
                new DatePicker({ value: "{date}",
                  displayFormat: "dd/MM/yyyy",
                  valueFormat: "yyyy-MM-dd"
                }),
                new TimePicker({ value:"{startTime}",
                  change: this.onTimeChange.bind(this)
                }),
                new TimePicker({ value:"{endTime}", 
                  change: this.onTimeChange.bind(this)
                }),
                new Input({ value:"{hours}",
                  change: this.onTimeChange.bind(this)
                }),
                new Input({ value:"{totalHours}",
                  change: this.onTimeChange.bind(this)
                 }),
                new Button({
                  icon: "sap-icon://decline",
                  type: "Transparent",
                  press: this.onDeleteRow.bind(this)
              })
            ]
        });
        this.rebindTable(this.oReadOnlyTemplate, "Navigation");
        
        
      },
      rebindTable: function (oTemplate, sKeyboardMode) {
          this.oTable.bindItems({
              path: "/workData",
              template: oTemplate,
              templateShareable: true
          });
      },
      onEdit: function () {
          this.aBackupData = JSON.parse(JSON.stringify(this.getView().getModel().getProperty("/workData")));
          this.getView().getModel("visibilityRules").setProperty("/currentState", "EDITED");
          this.visibilityModel.updateBindings(true);
          this.rebindTable(this.oEditableTemplate, "Edit");
      },
      onSave: function () {
          this.getView().getModel("visibilityRules").setProperty("/currentState", "SAVED");
          this.visibilityModel.updateBindings(true);
          this.rebindTable(this.oReadOnlyTemplate, "Navigation");
          // Recalcular el total de horas después de guardar
          var totalHours = this.calculateTotalHours(); // Método que calcula el total de todas las entradas
          var oModel = this.getView().getModel();
          var oData = oModel.getData();
          oData.totalHours = totalHours;
          oModel.setData(oData);
      },
      onCancel: function () {
          this.getView().getModel().setProperty("/workData", this.aBackupData);
          this.getView().getModel("visibilityRules").setProperty("/currentState", "CANCELED");
          this.visibilityModel.updateBindings(true);
          this.rebindTable(this.oReadOnlyTemplate, "Navigation");
      },
      onAdd: function () {
          var oModel = this.getView().getModel();
          var oData = oModel.getData();
          var oNewEntry = {
              date: "",          
              startTime: "",      
              endTime: "",        
              hours: "",          
              totalHours: ""     
          };
          oData.workData.push(oNewEntry);
          oModel.setData(oData);
          this.getView().byId("workTable").getBinding("items").refresh();
      },
      onDeleteRow: function (oEvent) {
        var oButton = oEvent.getSource();
        var oContext = oButton.getBindingContext();
        var sPath = oContext.getPath(); 
        var oModel = this.getView().getModel();
        // Crear y mostrar el diálogo de confirmación
        if (!this._oConfirmDialog) {
            this._oConfirmDialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({ text: "¿Estás seguro de que deseas eliminar esta fila?" }),
                beginButton: new Button({
                    text: "Sí",
                    press: function () {
                        // Eliminar la fila del modelo
                        var aData = oModel.getProperty("/workData");
                        var iIndex = parseInt(sPath.split("/")[2], 10);
                        aData.splice(iIndex, 1);
                        oModel.setProperty("/workData", aData);
                        // Cerrar el diálogo
                        this._oConfirmDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "No",
                    press: function () {
                        // Cerrar el diálogo sin eliminar
                        this._oConfirmDialog.close();
                    }.bind(this)
                })
            });
            this.getView().addDependent(this._oConfirmDialog);
        }
        this._oConfirmDialog.open();
      },
      onStart: function () {
        this.getView().getModel("visibilityRules").setProperty("/currentState", "STARTED");
        if (!this.isRunning) {
          this.isRunning = true;
          // Guardar el momento en que se da inicio (sin afectar `elapsedTime`)
          this.startTime = new Date();
          // Iniciar el temporizador
          this.timer = setInterval(this.updateTime.bind(this), 1000);
          
          // Registrar el nuevo inicio en la tabla
          var oModel = this.getView().getModel();
          var oData = oModel.getData();
          // Formatear la fecha y hora actual
          var oFormat = DateFormat.getInstance({
            pattern: "EEEE, dd/MM/yyyy",
          });
          var sFormattedDate = oFormat.format(new Date());
          // Asegúrate de que las horas previamente editadas no se pierdan
        var currentWorkEntry = oData.workData[oData.workData.length - 1];
        if (currentWorkEntry && currentWorkEntry.hours) {
          this.elapsedTime = this.convertTimeToMilliseconds(currentWorkEntry.hours);
        }
          // Actualizar la fecha en el modelo
          oData.date = sFormattedDate;
          // Añadir la entrada de trabajo con la nueva fecha de inicio
          oData.workData.push({
            date: sFormattedDate, 
            startTime: this.formatTime(new Date()),
            endTime: "",
            hours: "00:00:00",
            totalHours: "",
          });
          oModel.setData(oData);
          // También puedes actualizar la vista del diálogo de confirmación, si ya está abierto
          var oDialog = this.getView().byId("confirmEndDialog");
          if (oDialog) {
            oDialog.setModel(oModel);
            this.byId("editButton").setEnabled(true);           
          }
        };
        this.visibilityModel.updateBindings(true);
      },
      onPause: function () {
        this.getView().getModel("visibilityRules").setProperty("/currentState", "PAUSED");
        if (this.isRunning) {
          clearInterval(this.timer); // Detener el temporizador
          this.isRunning = false;
          // Calcular el tiempo transcurrido desde el último inicio
          var elapsedMilliseconds = new Date() - this.startTime;
          // Agregar los datos de pausa al modelo
          var oModel = this.getView().getModel();
          var oData = oModel.getData();
          var currentWorkEntry = oData.workData[oData.workData.length - 1];
          // Verifica si ya existe un tiempo registrado para evitar sobrescribir
        if (currentWorkEntry && currentWorkEntry.hours) {
          var previousTime = this.convertTimeToMilliseconds(currentWorkEntry.hours);
          elapsedMilliseconds += previousTime; // Sumar las horas previas al nuevo tiempo
        }
          // Guardar la hora de pausa y el tiempo trabajado desde el último inicio
          currentWorkEntry.endTime = this.formatTime(new Date());
          currentWorkEntry.hours =
            this.convertMillisecondsToTime(elapsedMilliseconds);
          // Actualizar el total acumulado en `elapsedTime`
          this.elapsedTime += elapsedMilliseconds;
          // Reflejar el total acumulado en el modelo
          currentWorkEntry.totalHours = "";
         
          // Actualizar la fecha y hora del diálogo
          var oFormat = DateFormat.getInstance({
            pattern: "EEEE, dd/MM/yyyy, HH:mm:ss",
          });
          var sFormattedDate = oFormat.format(new Date());
          // Actualizamos la fecha en el modelo y aseguramos que el diálogo se actualice si está abierto
          oData.date = sFormattedDate;
          oModel.setData(oData);
          var oDialog = this.getView().byId("confirmEndDialog");
          if (oDialog) {
            oDialog.setModel(oModel); 
            this.byId("editButton").setEnabled(true);
           
          }
        };
        this.visibilityModel.updateBindings(true);
      },
      onEnd: function () {
        var oView = this.getView();
        var oDialog = oView.byId("confirmEndDialog");
        // Si no existe, crear el diálogo dinámicamente
        if (!oDialog) {
          oDialog = sap.ui.xmlfragment(
            oView.getId(),
            "com.resulto.control.view.DialogoConfirmacion",
            this
          );
          oView.addDependent(oDialog);
        }
        oDialog.open();
      },
      onConfirmEnd: function () {
        this.getView().getModel("visibilityRules").setProperty("/currentState", "FINISHED");
        if (this.timer) {
          clearInterval(this.timer);
        }
        this.isRunning = false;
        // Calcular el tiempo desde el último inicio
        var elapsedMilliseconds = new Date() - this.startTime;
        var oModel = this.getView().getModel();
        var oData = oModel.getData();
        var currentWorkEntry = oData.workData[oData.workData.length - 1];
        // Verifica si ya existe un tiempo registrado para evitar sobrescribir
        if (currentWorkEntry && currentWorkEntry.hours) {
          var previousTime = this.convertTimeToMilliseconds(currentWorkEntry.hours);
          elapsedMilliseconds += previousTime; // Sumar las horas previas al nuevo tiempo
        }
        // Registrar los datos finales
        currentWorkEntry.endTime = this.formatTime(new Date());
        currentWorkEntry.hours =
          this.convertMillisecondsToTime(elapsedMilliseconds);
         // Actualizar el total acumulado
         this.elapsedTime += elapsedMilliseconds;
        // Reflejar el total acumulado en el modelo
        currentWorkEntry.totalHours = this.convertMillisecondsToTime(this.elapsedTime); 
        oModel.setData(oData);
        // Resetear el estado para un nuevo día
        this.elapsedTime = 0;
        this.startTime = null;
        oModel.setProperty("/time", "00:00:00");
        // Actualizar la fecha y hora en el diálogo
        var oFormat = DateFormat.getInstance({
          pattern: "EEEE, dd/MM/yyyy, HH:mm:ss",
        });
        var sFormattedDate = oFormat.format(new Date());
        // Actualizamos la fecha en el modelo y aseguramos que el diálogo se actualice si está abierto
        oData.date = sFormattedDate;
        oModel.setData(oData);
        // Cerrar el diálogo
        var oDialog = this.getView().byId("confirmEndDialog");
        if (oDialog) {
          oDialog.setModel(oModel); 
          oDialog.close();
        };
        this.visibilityModel.updateBindings(true);
      },
      onCancelEnd: function () {
        // Cerrar el diálogo sin realizar cambios
        var oDialog = this.getView().byId("confirmEndDialog");
        if (oDialog) {
          oDialog.close();
        }
      },
      updateTime: function () {
        var elapsedMilliseconds = new Date() - this.startTime + this.elapsedTime;
        var formattedTime = this.convertMillisecondsToTime(elapsedMilliseconds);
        // Actualizar el modelo con el tiempo actual (esto se reflejará en la vista)
        this.getView().getModel().setProperty("/time", formattedTime);
      },
      formatTime: function (date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        return (
          this.formatNumber(hours) +
          ":" +
          this.formatNumber(minutes) +
          ":" +
          this.formatNumber(seconds)
        );
      },
      formatNumber: function (number) {
        return number < 10 ? "0" + number : number;
      },
      calculateHours: function (elapsedMilliseconds) {
        var totalSeconds = Math.floor(elapsedMilliseconds / 1000);
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;
        return (
          this.formatNumber(hours) +
          ":" +
          this.formatNumber(minutes) +
          ":" +
          this.formatNumber(seconds)
        );
      },
      calculateTotalHours: function () {
        var oModel = this.getView().getModel();
        var oData = oModel.getData();
        var totalMilliseconds = 0;
        // Recorre todas las entradas de trabajo para sumar las horas
        oData.workData.forEach(function (entry) {
          if (entry.hours) {
            var timeParts = entry.hours.split(":");
            var hours = parseInt(timeParts[0], 10);
            var minutes = parseInt(timeParts[1], 10);
            var seconds = parseInt(timeParts[2], 10);
            // Convierte el tiempo de cada entrada a milisegundos y acumula
            totalMilliseconds += (hours * 3600 + minutes * 60 + seconds) * 1000;
          }
        });
        // Convierte el total de milisegundos a formato HH:mm:ss
        return this.convertMillisecondsToTime(totalMilliseconds);
      },
      convertMillisecondsToTime: function (milliseconds) {
        var totalSeconds = Math.floor(milliseconds / 1000);
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;
        return (
          this.formatNumber(hours) +
          ":" +
          this.formatNumber(minutes) +
          ":" +
          this.formatNumber(seconds)
        );
      },
      onTimeChange: function (oEvent) {
        // Obtener el modelo y los datos de la tabla
          var oModel = this.getView().getModel();
          var oData = oModel.getData();
          // Obtener el índice de la fila que fue modificada
          var oContext = oEvent.getSource().getBindingContext();
          var iIndex = oContext.getPath().split("/")[2];
          // Recuperar la fila modificada
          var oWorkEntry = oData.workData[iIndex];
          // Obtener las horas modificadas
          var startTime = oWorkEntry.startTime;
          var endTime = oWorkEntry.endTime;
          // Calcular las horas trabajadas, si startTime y endTime están completos
          if (startTime && endTime) {
              var start = this.convertTimeToMilliseconds(startTime);
              var end = this.convertTimeToMilliseconds(endTime);
              // Calcular la diferencia en milisegundos
              var diffMilliseconds = end - start;
              // Actualizar las horas trabajadas
              oWorkEntry.hours = this.convertMillisecondsToTime(diffMilliseconds);
          }
          // Actualizar el total de horas después de cada cambio
          var totalHours = this.calculateTotalHours();
          oData.totalHours = totalHours;
          oModel.setData(oData);
      },
      // Convierte un tiempo (HH:mm:ss) a milisegundos
      convertTimeToMilliseconds: function (time) {
          var timeParts = time.split(":");
          var hours = parseInt(timeParts[0], 10);
          var minutes = parseInt(timeParts[1], 10);
          var seconds = parseInt(timeParts[2], 10);
          return (hours * 3600 + minutes * 60 + seconds) * 1000;
      }
    });
  }
);