Vue.component('login', {
  template: `
    <v-btn @click="$emit('login')">
      Log In
    </v-btn>
  `,
});

Vue.component('logout', {
  template: `
    <v-btn @click="$emit('logout')">Logout</v-btn>
  `
});

Vue.component('crud-table', {
  data: function() {
    return {
      dialog: false,
      dialogDelete: false,
      data: [],
      //
      assignments: [],
      positionTitles: [],
      years: [], // academic years
      isEditing: false,
      editedPosition: {
        id: 0,
        officer_position_title: '', // look into best practices as this is only convenient to communicate with python backend
      },
      defaultPosition: {
        id: 0,
        officer_position_title: '',
      }
    };
  },
  computed: {
    headers: function() {      
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
          value: 'officer_position_title'
        }
      ];

      const academicHeaders = [];
      for (let property in this.data[0]) { // use arbitrary dataset to establish headers? 
        if (regex.test(property)) {
          academicHeaders.push({
            text: property,
            value: `${property}.officer_full_name`
          });
        }
      }
      
      return firstHeader.concat(academicHeaders);
    },

    formTitle: function() {
      return this.isEditing ? 'Edit TDA Position' : 'New TDA Position';
    },

    isAssignment: function(item) {
      console.log(item);
      return true;
    }
  },
  watch: {
    dialog (val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
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
    getData: function() {
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
      xhr.open('GET', 'http://localhost:5000/data');
      let that = this;
      xhr.onload = function() {
        if (xhr.status === 200) {
          that.data = xhr.response.data;
        }
      }

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
    getPositions: function() {
      const xhr = new XMLHttpRequest();
      xhr.responseType = "json";
      xhr.open('GET', 'http://localhost:5000/position_titles');
      let that = this;
      xhr.onload = function() {
        that.positionTitles = xhr.response.officer_position_titles;
      };
      xhr.send();
    },
    editPosition: function (item) {
      this.isEditing = true;
      this.editedPosition = item;
      this.dialog = true;
    },
    close: function() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedPosition = Object.assign({}, this.defaultPosition);
        this.isEditing = false;
        this.getData();
      });
    },
    save: function() {
      // POST AND PUT depending on this.
      let that = this;
      let xhr = new XMLHttpRequest();

      xhr.responseType = "json";

      if (this.isEditing) { // PUT request
        xhr.open("PUT", `http://localhost:5000/position_titles/${this.editedPosition.id}`);
        xhr.setRequestHeader(
          "Content-type",
          "application/json; charset=utf-8"
        );
        const updatedPositionTitle = JSON.stringify({
          officer_position_title: this.editedPosition.officer_position_title,
        });

        xhr.send(updatedPositionTitle);

        xhr.onload = function() {
          if (xhr.status != 201) {
            // handle error

            alert(`Error: ${xhr.status}`);
            return;
          }
          console.log("Update successful");
          that.close();
        };
      } else { // POST request
        xhr.open("POST", "http://localhost:5000/position_titles");
        xhr.setRequestHeader(
          "Content-type",
          "application/json; charset=utf-8"
        );
        const newPositionTitle = JSON.stringify({
          officer_position_title: this.editedPosition.officer_position_title,
        });

        xhr.send(newPositionTitle);

        xhr.onload = function() {
          if (xhr.status != 200) {
            // handle error
            
            // temporary as alerts are not good for UI
            alert(`Error: ${xhr.status}`);
            return;
          } 
          console.log("CREATED: New Position Title added successfully.");
          that.close();
        }
      }
    }
  },
  mounted: function() {
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
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="success" v-bind="attrs" v-on="on">
                <v-icon left>mdi-plus-circle-outline</v-icon>ADD TDA POSITION</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
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
                  text @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text @click="save"
                >
                  Save
                </v-btn>
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
          <v-btn v-if="!item.AY2223.officer_full_name" class="white--text green">ADD ASSIGNMENT</v-btn>
          <div v-else>
            {{ value }}<br>
            <v-btn class="white--text amber darken-1">EDIT ASSIGN</v-btn>
            <v-btn class="white--text red darken-1">DEL ASSIGN</v-btn>
          </div>
        </v-row>
      </template>
      <template v-slot:item.AY2324.officer_full_name="{ item, value }">
        <v-row>
          <v-btn v-if="!item.AY2324.officer_full_name" class="white--text green">ADD ASSIGNMENT</v-btn>
          <div v-else>
            {{ value }}<br>
            <v-btn class="white--text amber darken-1">EDIT ASSIGN</v-btn>
            <v-btn class="white--text red darken-1">DEL ASSIGN</v-btn>
          </div>
        </v-row>
      </template>
      <template v-slot:item.AY2425.officer_full_name="{ item, value }">
        <v-row>
          <v-btn v-if="!item.AY2425.officer_full_name" class="white--text green">ADD ASSIGNMENT</v-btn>
          <div v-else>
            {{ value }}<br>
            <v-btn class="white--text amber darken-1">EDIT ASSIGN</v-btn>
            <v-btn class="white--text red darken-1">DEL ASSIGN</v-btn>
          </div>
        </v-row>
      </template>
      <template v-slot:item.AY2526.officer_full_name="{ item, value }">
        <v-row>
          <v-btn v-if="!item.AY2526.officer_full_name" class="white--text green">ADD ASSIGNMENT</v-btn>
          <div v-else>
            {{ value }}
            <v-btn class="white--text amber darken-1">EDIT ASSIGN</v-btn>
            <v-btn class="white--text red darken-1">DEL ASSIGN</v-btn>
          </div>
        </v-row>
      </template>
      <template v-slot:item.AY2627.officer_full_name="{ item, value }">
        <v-row>
          <v-btn v-if="!item.AY2627.officer_full_name" class="white--text green">ADD ASSIGNMENT</v-btn>
          <div v-else>
            {{ value }}
            <v-btn class="white--text amber darken-1">EDIT ASSIGN</v-btn>
            <v-btn class="white--text red darken-1">DEL ASSIGN</v-btn>
          </div>
        </v-row>
      </template>
    </v-data-table>
  `
});

new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data: {
    isLoggedIn: true
  },
  methods: {
    login: function() {
        let that = this;
        let xhr = new XMLHttpRequest();

        xhr.open('POST', 'http://localhost:5000/login');
        xhr.withCredentials = true;

        xhr.responseType = "json";
        xhr.setRequestHeader(
          "Content-type",
          "application/json; charset=utf-8",
        );
        xhr.setRequestHeader(
          'Accept', 'application/json'
        )

        xhr.send(JSON.stringify({
            username: "MarekKoz",
            password: "testpass123"
        }));

        xhr.onload = function() {
          if (xhr.status != 200) {
            alert(`Error ${xhr.status}: ${xhr.statusText}`);
          } else {
            console.log(xhr.response.message);
            that.isLoggedIn = true;
            // localStorage.setItem('Set-Cookie', xhr.getResponseHeader('Set-Cookie'));
          }
        }
      },
    logout: function() {
      let that = this;

      let xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:5000/logout');

      xhr.responseType = "json";


      xhr.onload = function() {
        if (xhr.status != 200) {
          alert(`Error ${xhr.status}: ${xhr.statusText}`);
        } else {
          console.log(xhr.response.message);
          this.isLoggedIn = false;
        }
      }

    },
  }
})