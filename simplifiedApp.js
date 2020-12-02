Vue.component('assignments-table', { // global component; maybe local components are better?
  data: function() {
    return {
      dialog: false,
      dialogDelete: false,
      assignmentToDelete: null,
      assignments: [],
      personnel: [],
      selectedPersonnel: null,
      selectedYear: null,
      years: [],
      headers: [
        {
          text: 'id',
          align: 'start',
          sortable: false,
          value: 'id'
        },
        {
          text: 'School Year',
          value: 'academic_year'
        },
        {
          text: 'Over Hire',
          value: 'overhire'
        },
        {
          text: 'Remarks',
          value: 'remarks'
        },
        {
          text: 'Personnel',
          value: 'personnel'
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false
        }
      ],
      isEditMode: false,
      editedAssignment: {
        personnel: '',
        academic_year: '',
        overhire: false,
        remarks: false,
      },
      defaultAssignment: {
        personnel: '',
        academic_year: '',
        overhire: false,
        remarks: false,
      },
    };
  },
  computed: {
    formTitle: function() {
      return this.isEditMode ? 'Edit TDA Assignment' : 'New TDA Assignment';
    },
  },
  watch: {
    dialog: function(val) {
      val || this.close();
    },
    dialogDelete: function(val) {
      val || this.closeDelete();
    },
  },
  methods: {
    getData: function() { // probs not best 
      // supposed to be concurrent ajax
      const index = ["assignments", "officers", "years"];

      for (let i = 0; i < index.length; i++) {
        const url = `http://localhost:5000/${index[i]}`
        const that = this;
        const xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        xhr.open("GET", url);

        xhr.send();

        xhr.onload = function() {
          if (xhr.status === 200) {
            if (index[i] === "assignments") {
              that.assignments = xhr.response.assignments;
            } else if (index[i] === "officers") {
                // that.selectPersonnelOptions = xhr.response.officers.map(function(officer) {
                //   return officer.first_name + ' ' + officer.last_name;
                // });
                that.personnel = xhr.response.officers.map(function(officer) {
                  return {
                    ...officer,
                    'name': officer['first_name'] + ' ' + officer['last_name'],
                  }
                });
            } else {
                // that.selectYearOptions = xhr.response.academic_years.map(function(yr) {
                //   return yr.academic_year;
                // });
                that.years = xhr.response.academic_years;
            }
          }
          // should handle bad request
        }
      }
    },
    editAssignment: function(item) {
      this.isEditMode= true;
      this.editedAssignment = item;
      this.dialog = true;
    },
    close: function() {
      this.dialog = false;
      this.selectedPersonnel = null;
      this.selectedYear = null;
      this.$nextTick(() => { // arrow function may not be usable without babel etc.
        this.editedAssignment = Object.assign({}, this.defaultAssignment);
        this.isEditMode = false;
        this.getData();
      });
    },
    closeDelete: function() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedAssignment = Object.assign({}, this.defaultAssignment);
        this.isEditMode = false;
        this.getData();
      });
    },
    deleteAssignment: function(item) {
      this.assignmentToDelete = item;
      this.dialogDelete = true;
    },
    deleteConfirm: function() {
      // sub-optimal by having two delete methods to ultimately delete an assignment
      let that = this;
      let xhr = new XMLHttpRequest();

      let assignmentId = this.assignmentToDelete.id;
      let url = `http://localhost:5000/assignments/${assignmentId}`;

      xhr.open("DELETE", url);
      xhr.send();

      xhr.onload = function() {
        if (xhr.status === 200) {
          console.log(`Assignment ${assignmentId} successfully deleted.`);
          that.closeDelete();
        }
        // handle error
      };
    },
    save: function() {
      // POST AND PUT depending on this.
      let that = this;
      let xhr = new XMLHttpRequest();

      xhr.responseType = "json";

      if (this.isEditMode) { // PUT request
        // bad approach as PUT is similar to POST and violates DRY principle, callback of hell (idk about nested xmlhttp)
        xhr.open("GET", `http://localhost:5000/officers/${that.selectedPersonnel}`)
        xhr.send();
        xhr.onload = function() {
          const positionID = xhr.response.position_id;
          xhr.open("PUT", `http://localhost:5000/assignments/${that.editedAssignment.id}`);
          xhr.setRequestHeader(
            "Content-type",
            "application/json; charset=utf-8"
          );
          const updatedAssignment = JSON.stringify({
            overhire: that.editedAssignment.overhire,
            remarks: that.editedAssignment.remarks,
            officer_id: that.selectedPersonnel,
            year_id: that.selectedYear,
            position_title_id: positionID
          });
  
          xhr.send(updatedAssignment);
  
          xhr.onload = function() {
            if (xhr.status != 201) {
              // handle error
  
              alert(`Error: ${xhr.status}`);
              return;
            }
            console.log("Update successful");
            that.close();
          };
        }
      } else { // POST request
        // bad approach but get officer's position id by making get request with selectedPersonnel
        xhr.open("GET", `http://localhost:5000/officers/${that.selectedPersonnel}`);
        xhr.send();
        xhr.onload = function() {
          if (xhr.status == 200) {
            const positionID = xhr.response.position_id;
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
              position_title_id: positionID
            });

            xhr.send(newAssignment);

            xhr.onload = function() {
              if (xhr.status != 200){
                // handle error 
                console.log(`Error: ${xhr.status}`);
                alert('Distinct Annual Academic Year Assignments Per Position please');
                return;
              }
              console.log("CREATED: New Assignment added successfully.");
              that.close();
            }
          }
        }
      }
    }
  },
  mounted: function() {
    this.getData();
  },
  template: `
    <v-data-table
      :items="assignments"
      :headers="headers"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Assignments</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-icon>mdi-refresh</v-icon>
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                New Assignment
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-select
                      :items="personnel"
                      v-model="selectedPersonnel"
                      item-text="name"
                      item-value="id"
                      label="SELECT PERSONNEL">
                    </v-select>
                  </v-row>
                  <v-row>
                    <v-select
                      :items="years"
                      v-model="selectedYear"
                      item-text="academic_year"
                      item-value="id"
                      label="SELECT ACADEMIC YEAR"
                    >
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
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="save">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="deleteConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class ="mr-2" @click="editAssignment(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="deleteAssignment(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  `
});

new Vue({
  el: '#app',
  vuetify: new Vuetify(),
})