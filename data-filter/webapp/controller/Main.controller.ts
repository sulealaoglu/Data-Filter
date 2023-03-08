import BaseController from "./BaseController";
import * as XLSX from "xlsx";
import JSONModel from "sap/ui/model/json/JSONModel";
import CheckBox from "sap/m/CheckBox";
import Input from "sap/m/Input";
import ComboBox from "sap/m/ComboBox";
import Dialog from "sap/m/Dialog";
import Button from "sap/m/Button";
import MultiComboBox from "sap/m/MultiComboBox";

/**
 * @namespace com.myorg.myFilterApp.controller
 */

export default class Main extends BaseController {
  private myModel = new JSONModel();
  private selectModel = new JSONModel();
  private filterModel = new JSONModel();
  private signModel = new JSONModel();
  private columnModel = new JSONModel();
  private myDialog = new Dialog();
  public isShuffled = false;
  public isFiltered = false;
  public myKey = "id";
  public clickedRowIndex: number;

  public onInit() {
    this.myModel.loadData("../jdata/MOCK_DATA.json"); //dosya okuma
    //this.getView().setModel(this.myModel);
    this.filterModel.loadData("../jdata/MOCK_DATA.json");

    this.getView().setModel(this.filterModel);

    const selectOptions = [
      { key: "id", value: "ID" },

      { key: "username", value: "User Name" },

      { key: "name", value: "Name" },

      { key: "surname", value: "Surname" },

      { key: "email", value: "E-mail" },

      { key: "gender", value: "Gender" },
    ];

    this.selectModel.setData(selectOptions);
    this.getView().setModel(this.selectModel, "selectOptions");

    let dynamicModelData = {
      items: [
        { text: "Male", key: 0 },
        { text: "Female", key: 1 },
        { text: "Genderfluid", key: 2 },
        { text: "Bigender", key: 3 },
        { text: "Genderqueer", key: 4 },
      ],
      showInput: false,
      showMailField: false,
      title: "Gender Filter",
    };

    this.signModel.setData(dynamicModelData);
    this.getView().setModel(this.signModel, "dynamicModel");

    let columnodelData = {
      show_id: true,
      show_name: true,
      show_surname: true,
      show_userName: true,
      show_email: true,
      show_gender: true,
    };

    this.columnModel.setData(columnodelData);
    this.getView().setModel(this.columnModel, "columnModel");
  }

  sortData(myModel: JSONModel) {
    //daha önce karıştırıldıysa ve cbox tiki kaldırılıp filtrelenmek istendiyse,shuffled datayı sort işlemi
    const data = myModel.getData();
    const newData = data.sort((a: any, b: any) => a.id - b.id);
    myModel.setData(newData);
    this.isShuffled = false;
  }

  onFilterBtnClicked(): void {
    const selectedKey = (
      this.getView().byId("comboBoxId") as ComboBox
    ).getSelectedKey();

    const input = (this.getView().byId("searchedItem") as Input).getValue();
    this.filterData(selectedKey, input);
    let checkbox = this.byId("cbox") as CheckBox;
    let checkboxValue = checkbox.getSelected();

    if (checkboxValue) {
      this.handleShuffle(this.filterModel);
    } else if (!checkboxValue && this.isShuffled) {
      this.sortData(this.filterModel);
      console.log(this.myModel.getData());
    }

    this.byId("tab1").setModel(this.filterModel);
  }

  handleShuffle(myModel: JSONModel): void {
    this.isShuffled = true;
    let data = myModel.getData();

    for (let i = data.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }

    myModel.setData(data);
  }

  filterData(selectedKey: string, input: string): void {
    this.isFiltered = true;
    const data = this.filterModel.getData();
    let filteredData;

    if (selectedKey == "id") {
      filteredData = data.filter(
        (item: { id: number }) => item.id === parseFloat(input)
      );

      this.filterModel.setData(filteredData);
    } else {
      filteredData = data.filter(
        (item: { [key: string]: string }) => item[selectedKey] === input
      );
    }

    this.filterModel.setData(filteredData);
  }

  onColumnBtnClicked(oEvent: any) {
    const buttonId = oEvent.getSource().getId(); //it returns "__component0---main--genderBtn"
    const parts = buttonId.split("--");
    const desiredId = parts[parts.length - 1]; // Output: "genderBtn"

    let dynamicModelData = {
      items: [
        { text: "=", key: 0 },3
        { text: "<", key: 1 },
        { text: "<=", key: 2 },
        { text: ">", key: 3 },
        { text: ">=", key: 4 },
      ],
      showInput: true,
      showMailField: false,
      title: "ID Filter",
    };

    switch (desiredId) {
      case "nameBtn":
        dynamicModelData.title = "Name Filter";
        this.myKey = "name";
        break;

      case "surnameBtn":
        dynamicModelData.title = "Surname Filter";
        this.myKey = "surname";
        break;

      case "userNameBtn":
        dynamicModelData.title = "UserName Filter";
        this.myKey = "username";
        break;

      case "emailBtn":
        dynamicModelData.title = "E-mail Filter";
        dynamicModelData.showMailField = true;
        this.myKey = "email";
        break;

      case "genderBtn":
        dynamicModelData = {
          items: [
            { text: "Male", key: 0 },
            { text: "Female", key: 1 },
            { text: "Genderfluid", key: 2 },
            { text: "Bigender", key: 3 },
            { text: "Genderqueer", key: 4 },
            { text: "Agender", key: 5 },
          ],
          showInput: false,
          showMailField: false,
          title: "Gender Filter",
        };
        this.myKey = "gender";
        break;
      default:
        this.myKey = "id";
        break;
    }

    this.signModel.setData(dynamicModelData);
    this.getDialogInputBox();
  }

  getAllData(): void {
    let checkbox = this.byId("cbox") as CheckBox;
    let checkboxValue = checkbox.getSelected();
    console.log(checkboxValue, this.isShuffled);

    if (!checkboxValue && this.isShuffled) {
      this.sortData(this.myModel);
    } else if (checkboxValue) {
      this.handleShuffle(this.myModel);
    }

    this.isFiltered = false;
    this.filterModel.setData(this.myModel.getData());
    //this.byId("tab1").setModel(this.myModel);
  }

  deleteRow(oEvent: any) {
    if (!this.isFiltered) {
      //the operations process on myModel (the main model consisting all data)
      let oButton = oEvent.getSource();
      let oContext = oButton.getBindingContext();
      let sPath = oContext.getPath(); // for example: /1 /2 ==> index of table
      let oModel = this.getView().getModel();
      let aData = oModel.getProperty("/");
      let iIndex = sPath.split("/").pop(); // get the index of the item to delete
      aData.splice(iIndex, 1); // remove the item from the array
      this.myModel.setData(aData); // update the model with the new data
      this.filterModel.setData(aData);
    } else {
      //the operations process on filterModel (we need to find same data on main data)
      let oButton = oEvent.getSource();
      let oContext = oButton.getBindingContext();
      let sPath = oContext.getPath(); // for example: /1 /2 ==> index of table
      let oModel = this.getView().byId("tab1").getModel(); // get all the data
      let aData = oModel.getProperty("/");
      let iIndex = sPath.split("/").pop();

      //get the ID of the item to delete
      let itemId = oModel.getProperty(sPath).id;
      aData.splice(iIndex, 1); //filter model deletion
      let mainData = this.myModel.getData();

      // Finding and deleting the same data in the main model
      for (let i = 0; i < mainData.length; i++) {
        if (mainData[i].id === itemId) {
          mainData.splice(i, 1);
          break;
        }
      }

      this.myModel.setData(mainData); // update the main model with the new data
      this.filterModel.setData(aData); // update the model with the new data
    }
  }

  getDialogInputBox() {
    const myView = this.getView();
    this.myDialog = myView.byId("dialogId") as Dialog;

    if (!this.myDialog) {
      this.myDialog = sap.ui.xmlfragment(
        myView.getId(),
        "com.myorg.myFilterApp/view/InputDialog",
        this
      ) as Dialog;
      myView.addDependent(this.myDialog);
    }

    this.myDialog.open();

    myView.addEventDelegate({
      onAfterShow() {
        var input = myView.byId("fragment_input") as Input;
        console.log(input);
        if (input) {
          input.focus();
        }
      },
    });
    
  }

  closeDialog() {
    this.myDialog.close();
    this.myDialog.destroy();
  }

  onCancel() {
    this.closeDialog();
  }

  onConfirm() {
    let value = (this.getView().byId("fragment_input") as Input).getValue();
    let selectionBox = this.getView().byId("dynamicBox") as ComboBox;
    let selection;
    let selectedItem = selectionBox.getSelectedItem();

    if (selectedItem) {
      selection = selectedItem.getText();
      console.log("sda", selection);
    } else {
      let items = this.signModel.getData().items;
      selection = items[0].text;
      console.log(selection);
    }

    if (this.myKey === "gender") {
      this.filterData("gender", selection);
    } else if (this.myKey === "email") {
      const value_mail = (
        this.getView().byId("fragment_input2") as Input
      ).getValue();

      value = value + "@" + value_mail;

      this.filterWithOperator(selection, this.myKey, value);
    } else this.filterWithOperator(selection, this.myKey, value);

    this.closeDialog();
    this.byId("tab1").setModel(this.filterModel);
  }

  filterWithOperator(
    comparisonOperator: string,
    filterKey: string,
    input: string
  ) {
    let data = this.filterModel.getData();
    let filteredData;

    if (filterKey === "id") {
      console.log(input, comparisonOperator);
      filteredData = data.filter((item: { id: number }) => {
        switch (comparisonOperator) {
          case "=":
            return item.id == parseFloat(input);

          case "!=":
            return item.id != parseFloat(input);

          case ">":
            return item.id > parseFloat(input);

          case "<":
            return item.id < parseFloat(input);

          case "<=":
            return item.id <= parseFloat(input);

          case ">=":
            return item.id >= parseFloat(input);

          default:
            return false;
        }
      });
    } else if (filterKey != "gender") {
      if (comparisonOperator === "=") {
        comparisonOperator = "===";
      }
      filteredData = data.filter((item: { [key: string]: string }) => {
        if (item[filterKey] === null) {
          return false;
        }

        return (
          item[filterKey] !== null &&
          eval(`item[filterKey].toString() ${comparisonOperator} input`)
        );
      });
    } else if (filterKey == "gender") {
      this.filterData("gender", input);
    }

    console.log(filteredData);
    this.filterModel.setData(filteredData);
  }

  onEditBtnClicked(oEvent: any) {
    let oButton = oEvent.getSource();
    let oContext = oButton.getBindingContext();
    let sPath = oContext.getPath(); // for example: /1 /2 ==> index of table
    let iIndex = sPath.split("/").pop(); // get the index of the item to delete
    this.clickedRowIndex = iIndex;
    console.log(iIndex);

    const myView = this.getView();
    this.myDialog = myView.byId("editDialog") as Dialog;

    if (!this.myDialog) {
      this.myDialog = sap.ui.xmlfragment(
        myView.getId(),
        "com.myorg.myFilterApp/view/Edit",
        this
      ) as Dialog;
      myView.addDependent(this.myDialog);
    }

    this.myDialog.open();
  }

  handleLockButton(oEvent: any) {
    let oButton = oEvent.getSource() as Button; //get clicked button

    const buttonId = oEvent.getSource().getId(); //it returns "__component0---main--editGenderBtn"
    const parts = buttonId.split("--");
    const desiredId = parts[parts.length - 1];
    const inputId = desiredId.substring(0, desiredId.length - 3); // Output: "editGender"
    console.log(inputId);

    const oInput = this.byId(inputId) as Input;
    console.log(oInput.getProperty("editable"));

    if (oInput.getProperty("editable")) {
      //if editable true,then close editable and lock the button
      oButton.setIcon("sap-icon://locked");
      oButton.setType("Reject");
      oInput.setProperty("editable", false);
    } else {
      //unlock button
      oButton.setIcon("sap-icon://unlocked");
      oButton.setType("Accept");
      oInput.setProperty("editable", true);
    }
  }

  onEditConfirm() {
    let inputs = [
      this.getView().byId("editName") as Input,
      this.getView().byId("editSurname") as Input,
      this.getView().byId("editUserName") as Input,
      this.getView().byId("editEmail") as Input,
    ];
    let selectionBox = this.getView().byId("editGender") as ComboBox;
    let selection;

    const targetData = this.filterModel.getData()[this.clickedRowIndex]; //the data we get from clicked row

    inputs.forEach((input) => {
      let value = input.getValue();
      let key = input.getId().replace("edit", "").toLowerCase();
      let parts = key.split("--");
      let desiredKey = parts[parts.length - 1];

      if (value) {
        //if there is an input value
        console.log("denemeee00");
        targetData[desiredKey] = value; //update
      }
    });

    if (selectionBox) {
      //if there is an input value
      let selectedItem = selectionBox.getSelectedItem();
      if (selectedItem) {
        selection = selectedItem.getText();
        //if there is an input value
        targetData["gender"] = selection; //update
      }
    }

    console.log(targetData);
    this.filterModel.getData()[this.clickedRowIndex] = targetData;
    console.log(this.filterModel.getData()[this.clickedRowIndex]);
    //get the ID of the item to update
    let itemId = targetData.id;
    let mainData = this.myModel.getData();

    // Finding and update the same data in the main model
    for (let i = 0; i < mainData.length; i++) {
      if (mainData[i].id === itemId) {
        mainData[i] = targetData;
        break;
      }
    }
    this.myModel.setData(mainData);
    this.filterModel.refresh();
    this.closeDialog();
  }
  onCheckBoxClicked(oEvent: any) {
    let checkbox = oEvent.getSource();

    if (checkbox.getSelected()) {
      this.handleShuffle(this.filterModel);
    } else {
      this.sortData(this.filterModel);
    }
  }

  filterTableColumn() {
    this.setColumnModelDataFalse();
    let columnModelData = this.columnModel.getData();
    var select = (
      this.getView().byId("multiBox") as MultiComboBox
    ).getSelectedKeys();

    console.log(select);
    if (select.length === 0) {
      this.setColumnModelDataTrue();
    } else {
      for (let index = 0; index < select.length; index++) {
        const element = select[index];
        let property = "show_" + element;
        columnModelData[property] = true;
      }
      this.columnModel.setData(columnModelData);
    }
    console.log(columnModelData);
    this.columnModel.refresh();
  }

  setColumnModelDataFalse() {
    let columnModelData = {
      show_id: false,
      show_name: false,
      show_surname: false,
      show_userName: false,
      show_email: false,
      show_gender: false,
    };

    this.columnModel.setData(columnModelData);
  }
  setColumnModelDataTrue() {
    let columnModelData = {
      show_id: true,
      show_name: true,
      show_surname: true,
      show_userName: true,
      show_email: true,
      show_gender: true,
    };

    this.columnModel.setData(columnModelData);
    this.columnModel.refresh();
    console.log(this.columnModel.getData());
  }

  clearFilter() {
    this.setColumnModelDataTrue();
    (this.getView().byId("multiBox") as MultiComboBox).setSelectedKeys([]);
  }
}
