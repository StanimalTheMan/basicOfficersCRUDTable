Vue.component("login", {
  template: `
    <v-btn @click="$emit('login')">
      Log In
    </v-btn>
  `,
});

Vue.component("logout", {
  template: `
    <v-btn @click="$emit('logout')">Logout</v-btn>
  `,
});

Vue.component("crud-table", {
  data: function () {
    return {
      positionDialog: false,
      positionDialogDelete: false,
      //
      assignmentDialog: false,
      assignmentDialogDelete: false,
      assignmentToDelete: null,
      selectedYear: null,
      personnel: [],
      selectedPersonnel: null,
      selectedPositionTitleID: null,
      selectedAssignmentID: null,
      data: [],
      //
      assignments: [],
      positionTitles: [],
      years: [], // academic years
      //
      isPositionEditing: false,
      editedPosition: {
        id: 0,
        officer_position_title: "", // look into best practices as this is only convenient to communicate with python backend
      },
      defaultPosition: {
        id: 0,
        officer_position_title: "",
      },
      //
      isAssignmentEditing: false,
      editedAssignment: {
        id: null,
        overhire: false,
        remarks: false,
      },
      defaultAssignment: {
        id: null,
        overhire: false,
        remarks: false,
      },
    };
  },
  computed: {
    headers: function () {
      // let firstHeaders = [
      //   {
      //     text: "POSITION TITLE",
      //     value: 'officer_position_title'
      //   },
      //   {
      //     text: "RANK MOS",
      //   },
      // ];

      // const academicYears = [];
      // const seenAcademicYears = new Set();
      // // each data entry has all the unique years
      // for (let assignmentData of this.data) {
      //   const regex = /AY/;
      //   for (let property in assignmentData) {

      //     if (!seenAcademicYears.has(property) && regex.test(property)) {
      //       academicYears.push({
      //         text: property,
      //         value: property
      //       });
      //     }
      //     seenAcademicYears.add(property);
      //   }
      // }

      // for (let academicYearHeader of academicYears) {
      //   academicYearHeader.value = academic;
      // }

      // return firstHeaders.concat(academicYears);

      const regex = /AY/;
      const firstHeader = [
        {
          text: "POSITION TITLE",
          value: "officer_position_title",
        },
      ];

      const academicHeaders = [];
      for (let property in this.data[0]) {
        // use arbitrary dataset to establish headers?
        if (regex.test(property)) {
          academicHeaders.push({
            text: property,
            value: `${property}.officer_full_name`,
          });
        }
      }

      return firstHeader.concat(academicHeaders);
    },

    positionFormTitle: function () {
      return this.isPositionEditing ? "Edit TDA Position" : "New TDA Position";
    },

    assignmentFormTitle: function () {
      return this.isAssignmentEditing ? "Edit Assignment" : "New Assignment";
    },
  },
  watch: {
    positionDialog(val) {
      val || this.closePositionModal();
    },
    positionDialogDelete(val) {
      val || this.closeDeletePositionModal();
    },
    assignmentDialog(val) {
      val || this.closeAssignmentModal();
    },
    assignmentDialogDelete(val) {
      val || this.closeDeleteAssignmentModal();
    },
  },
  methods: {
    // getAssignments: function() {
    //   let xhr = new XMLHttpRequest();
    //   xhr.withCredentials = true;

    //   xhr.open('GET', 'http://localhost:5000/assignments');
    //   xhr.responseType = "json";
    //   // xhr.setRequestHeader(
    //   //   "Content-type",
    //   //   "application/json; charset=utf-8"
    //   // );

    //   xhr.send();

    //   let that = this;
    //   xhr.onload = function() {
    //     if (xhr.status != 200) {
    //       alert(`Error ${xhr.status}: ${xhr.statusText}`);
    //     } else {
    //       that.assignments = xhr.response.assignments;
    //     }
    //   };
    // }
    getData: function () {
      // attempt to get all initial data completely asynchronously (in a concurrent way)

      // const index = ["assignments", "position_titles", "years"];

      // for (let i = 0; i < index.length; i++) {
      //   const url = `http://localhost:5000/${index[i]}`;

      //   const xhr = new XMLHttpRequest();
      //   xhr.responseType = "json";
      //   xhr.open('GET', url);
      //   let that = this;
      //   xhr.onreadystatechange = function() {
      //     if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      //       // probably a better approach out there somewhere
      //       if (index[i] === "assignments") {
      //         that.assignments = xhr.response.assignments;
      //       } else if (index[i] === "position_titles") {
      //         that.positionTitles = xhr.response.officer_position_titles;
      //       } else {
      //         that.years = xhr.response.academic_years;
      //       }
      //     }
      //   }
      //   xhr.send();
      // }

      // attempt at getting data using many to many relationship btw positon titles and years
      const xhr = new XMLHttpRequest();
      xhr.responseType = "json";
      xhr.open("GET", "http://localhost:5000/data");
      let that = this;
      xhr.onload = function () {
        if (xhr.status === 200) {
          that.data = xhr.response.data;
        }
      };

      xhr.send();

      // const xhr = new XMLHttpRequest();
      // xhr.responseType = "json";
      // xhr.open('GET', 'http://localhost:5000/data');
      // let that = this;
      // xhr.onload = function() {
      //   if (xhr.status === 200) {
      //     that.data = xhr.response.data;
      //     that.getPositions();
      //     for (let positionTitle of that.positionTitles) {
      //       is_first_position_title_occurrence = true;
      //       for (let assignmentData of that.data) {
      //         if (is_first_position_title_occurence && assignmentData.position_title_id === positionTitle.id) {
      //           positionTitle = {
      //             officer_position_title: positionTitle.officer_position_title, // probs redundant
      //             ...assignmentData
      //           }
      //         }

      //       }
      //     }
      //     console.log(that.positionTitles);
      //   }
      // }
      // xhr.send();
    },
    addEditAssignment: function (
      item,
      annualAcademicYear,
      isEditingAssignment
    ) {
      if (isEditingAssignment) {
        this.isAssignmentEditing = true;
        this.editedAssignment = item;
        this.selectedAssignmentID = item[annualAcademicYear].id;
      }
      this.assignmentDialog = true;
      this.selectedYear = item[annualAcademicYear].academic_year_id;
      this.selectedPositionTitleID = item.position_title_id;
      // get officers of position to choose from
      let that = this;
      const xhr = new XMLHttpRequest();
      xhr.responseType = "json";
      xhr.open(
        "GET",
        `http://localhost:5000/officers/positionTitle/${item.position_title_id}`
      );
      xhr.send();
      xhr.onload = function () {
        if (xhr.status === 200) {
          that.personnel = xhr.response.personnel;
          // console.log(that.personnel);
        } else {
          alert(`Error: ${xhr.status}`);
        }
      };
    },
    editPosition: function (item) {
      this.isPositionEditing = true;
      this.editedPosition = item;
      this.positionDialog = true;
    },
    closeAssignmentModal: function (item) {
      this.assignmentDialog = false;
      this.selectedPersonnel = null;
      this.selectedYear = null;
      this.selectedAssignmentID = null;
      this.assignmentYearID = null;
      this.selectedPositionTitleID = null;
      this.$nextTick(() => {
        this.editedAssignment = Object.assign({}, this.defaultAssignment);
        this.isAssignmentEditing = false;
        this.getData();
      });
    },
    closePositionModal: function () {
      this.positionDialog = false;
      this.$nextTick(() => {
        this.editedPosition = Object.assign({}, this.defaultPosition);
        this.isPositionEditing = false;
        this.getData();
      });
    },
    closeDeleteAssignmentModal: function () {
      this.assignmentDialogDelete = false;
      this.selectedAssignmentID = null;
      this.$nextTick(() => {
        this.editedAssignment = Object.assign({}, this.defaultAssignment);
        this.isAssignmentEditing = false;
        this.getData();
      });
    },
    deleteAssignment: function (item, annualAcademicYear) {
      this.assignmentToDelete = item;
      this.selectedAssignmentID = item[annualAcademicYear].id;
      this.assignmentDialogDelete = true;
    },
    deleteAssignmentConfirm: function () {
      let that = this;
      let xhr = new XMLHttpRequest();

      let url =  `http://localhost:5000/assignments/${this.selectedAssignmentID}`;

      xhr.open("DELETE", url);
      xhr.send();

      xhr.onload = function() {
        if (xhr.status === 200) {
          console.log(`Assignment ${this.selectedAssignmentID} successfully deleted.`);
          that.closeDeleteAssignmentModal();
        }
      }
    },
    savePosition: function () {
      // POST AND PUT depending on this.
      let that = this;
      let xhr = new XMLHttpRequest();

      xhr.responseType = "json";

      if (this.isPositionEditing) {
        // PUT request
        console.log(this.editedPosition)
        xhr.open(
          "PUT",
          `http://localhost:5000/position_titles/${this.editedPosition.position_title_id}`
        );
        xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
        const updatedPositionTitle = JSON.stringify({
          officer_position_title: this.editedPosition.officer_position_title,
        });

        xhr.send(updatedPositionTitle);

        xhr.onload = function () {
          if (xhr.status != 201) {
            // handle error

            alert(`Error: ${xhr.status}`);
            return;
          }
          console.log("Update successful");
          that.closePositionModal();
        };
      } else {
        // POST request
        xhr.open("POST", "http://localhost:5000/position_titles");
        xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
        const newPositionTitle = JSON.stringify({
          officer_position_title: this.editedPosition.officer_position_title,
        });

        xhr.send(newPositionTitle);

        xhr.onload = function () {
          if (xhr.status != 200) {
            // handle error

            // temporary as alerts are not good for UI
            alert(`Error: ${xhr.status}`);
            return;
          }
          console.log("CREATED: New Position Title added successfully.");
          that.closePositionModal();
        };
      }
    },
    saveAssignment: function () {
      // POST AND PUT depending on this.
      let that = this;
      let xhr = new XMLHttpRequest();

      xhr.responseType = "json";

      if (this.isAssignmentEditing) { // PUT request
        xhr.open("PUT", `http://localhost:5000/assignments/${that.selectedAssignmentID}`);
        xhr.setRequestHeader(
          "Content-type",
          "application/json; charset=utf-8"
        );
        const updatedAssignment = JSON.stringify({
          overhire: that.editedAssignment.overhire,
          remarks: that.editedAssignment.remarks,
          officer_id: that.selectedPersonnel,
          year_id: that.selectedYear,
          position_title_id: that.selectedPositionTitleID
        });
        console.log(updatedAssignment)

        xhr.send(updatedAssignment);

        xhr.onload = function() {
          if (xhr.status != 201) {
            // handle error

            alert(`Error: ${xhr.status}`);
            return;
          }
          console.log("Update successful");
          that.closeAssignmentModal();
        };
      } else { // POST request
          // very similar to PUT request
          xhr.open("POST", "http://localhost:5000/assignments");
          xhr.setRequestHeader(
            "Content-type",
            "application/json; charset=utf-8"
          );
          const newAssignment = JSON.stringify({
            overhire: that.editedAssignment.overhire,
            remarks: that.editedAssignment.remarks,
            officer_id: that.selectedPersonnel,
            year_id: that.selectedYear,
            position_title_id: that.selectedPositionTitleID
          });
          console.log(newAssignment);

          xhr.send(newAssignment);

          xhr.onload = function() {
            if (xhr.status != 200) {
              // handle error
              console.log(`Error: ${xhr.status}`);
              return;
            }
            console.log("CREATED: New Assignment added successfully.");
            that.closeAssignmentModal();
          }
      }
    },
  },
  mounted: function () {
    this.getData();
  },
  template: `
    <v-data-table
      :headers="headers"
      :items="data"
    >
      <template v-slot:top>
        <v-row>
          <div class="display-1 font-weight-regular">
            DUIC: W1FB20 OFC OF DEAN TDA 0122 (10/6/2020)
          </div>
        </v-row>
        <v-row>
          <v-dialog
            v-model="positionDialog"
            max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="success" v-bind="attrs" v-on="on">
                <v-icon left>mdi-plus-circle-outline</v-icon>ADD TDA POSITION</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ positionFormTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-text-field  
                    v-model="editedPosition.officer_position_title"
                    label="Officer Position Title"
                  >
                  </v-text-field>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn 
                  color="blue darken-1"
                  text @click="closePositionModal"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text @click="savePosition"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog
            v-model="assignmentDialog"
            max-width="500px"
          >
            <v-card>
              <v-card-title>
                <span class="headline">{{ assignmentFormTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-select
                      :items="personnel"
                      v-model="selectedPersonnel"
                      item-text="full_name"
                      item-value="id"
                      label="SELECT PERSONNEL">
                    </v-select>
                  </v-row>
                  <v-row>
                    <v-checkbox
                      v-model="editedAssignment.overhire"
                      label="Overhire"
                    >
                    </v-checkbox>
                  </v-row>
                  <v-row>
                    <v-text-field
                      v-model="editedAssignment.remarks"
                      label="Remarks"
                    >
                    </v-text-field>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeAssignmentModal">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="saveAssignment">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="assignmentDialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this assignment?</v-card-title>
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="deleteAssignmentConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
      </template>
      <template v-slot:item.officer_position_title="{ item }">
        <v-row>
          {{ item.officer_position_title }}
        </v-row>
        <v-row>
          <v-btn class="white--text amber darken-1" @click="editPosition(item)">EDIT POS</v-btn>
        </v-row>
      </template>
      <template v-slot:item.AY2223.officer_full_name="{ item, value }">
        <v-row>
          <v-btn v-if="!item.AY2223.officer_full_name" class="white--text green" @click="addEditAssignment(item, 'AY2223', false)">ADD ASSIGNMENT</v-btn>
          <div v-else>
            {{ value }}<br>
            <v-btn class="white--text amber darken-1" @click="addEditAssignment(item, 'AY2223', true)">EDIT ASSIGN</v-btn>
            <v-btn class="white--text red darken-1" @click="deleteAssignment(item, 'AY2223')">DEL ASSIGN</v-btn>
          </div>
        </v-row>
      </template>
      <template v-slot:item.AY2324.officer_full_name="{ item, value }">
        <v-row>
          <v-btn v-if="!item.AY2324.officer_full_name" class="white--text green" @click="addEditAssignment(item, 'AY2324', false)">ADD ASSIGNMENT</v-btn>
          <div v-else>
            {{ value }}<br>
            <v-btn class="white--text amber darken-1" @click="addEditAssignment(item, 'AY2324', true)">EDIT ASSIGN</v-btn>
            <v-btn class="white--text red darken-1" @click="deleteAssignment(item, 'AY2324')">DEL ASSIGN</v-btn>
          </div>
        </v-row>
      </template>
      <template v-slot:item.AY2425.officer_full_name="{ item, value }">
        <v-row>
          <v-btn v-if="!item.AY2425.officer_full_name" class="white--text green" @click="addEditAssignment(item, 'AY2425', false)">ADD ASSIGNMENT</v-btn>
          <div v-else>
            {{ value }}<br>
            <v-btn class="white--text amber darken-1" @click="addEditAssignment(item, 'AY2425', true)">EDIT ASSIGN</v-btn>
            <v-btn class="white--text red darken-1" @click="deleteAssignment(item, 'AY2425')">DEL ASSIGN</v-btn>
          </div>
        </v-row>
      </template>
      <template v-slot:item.AY2526.officer_full_name="{ item, value }">
        <v-row>
          <v-btn v-if="!item.AY2526.officer_full_name" class="white--text green" @click="addEditAssignment(item, 'AY2526', false)">ADD ASSIGNMENT</v-btn>
          <div v-else>
            {{ value }}<br>
            <v-btn class="white--text amber darken-1" @click="addEditAssignment(item, 'AY2526', true)">EDIT ASSIGN</v-btn>
            <v-btn class="white--text red darken-1" @click="deleteAssignment(item, 'AY2526')">DEL ASSIGN</v-btn>
          </div>
        </v-row>
      </template>
      <template v-slot:item.AY2627.officer_full_name="{ item, value }">
        <v-row>
          <v-btn v-if="!item.AY2627.officer_full_name" class="white--text green" @click="addEditAssignment(item, 'AY2627', false)">ADD ASSIGNMENT</v-btn>
          <div v-else>
            {{ value }}<br>
            <v-btn class="white--text amber darken-1" @click="addEditAssignment(item, 'AY2627', true)">EDIT ASSIGN</v-btn>
            <v-btn class="white--text red darken-1" @click="deleteAssignment(item, 'AY2627')">DEL ASSIGN</v-btn>
          </div>
        </v-row>
      </template>
    </v-data-table>
  `,
});

new Vue({
  el: "#app",
  vuetify: new Vuetify(),
  data: {
    isLoggedIn: true,
  },
  methods: {
    login: function () {
      let that = this;
      let xhr = new XMLHttpRequest();

      xhr.open("POST", "http://localhost:5000/login");
      xhr.withCredentials = true;

      xhr.responseType = "json";
      xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
      xhr.setRequestHeader("Accept", "application/json");

      xhr.send(
        JSON.stringify({
          username: "MarekKoz",
          password: "testpass123",
        })
      );

      xhr.onload = function () {
        if (xhr.status != 200) {
          alert(`Error ${xhr.status}: ${xhr.statusText}`);
        } else {
          console.log(xhr.response.message);
          that.isLoggedIn = true;
          // localStorage.setItem('Set-Cookie', xhr.getResponseHeader('Set-Cookie'));
        }
      };
    },
    logout: function () {
      let that = this;

      let xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:5000/logout");

      xhr.responseType = "json";

      xhr.onload = function () {
        if (xhr.status != 200) {
          alert(`Error ${xhr.status}: ${xhr.statusText}`);
        } else {
          console.log(xhr.response.message);
          this.isLoggedIn = false;
        }
      };
    },
  },
});
