<template>
  <v-app>
    <Nav v-bind:headerName="headerName" v-bind:keycloak="keycloak" />
    <v-content>
      <br>
      <span class="display-3 font-weight-thin pa-8">RESTful Example:</span>
      <component
        v-bind:is="componentName"
        v-bind:peopleArr="peopleArr"
        v-bind:peopleHeader="peopleHeader"
      />
      <!-- <v-btn v-on:click="logOut">LOGOUT</v-btn> -->
    </v-content>
    <!-- <v-content>
      <HelloWorld />
    </v-content>-->
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
// import HelloWorld from "./components/HelloWorld.vue";

// ADD THE NEW COMPONENTS
import User from "./components/User.vue";
import Admin from "./components/Admin.vue";
import Nav from "./components/Nav.vue";

// ADD KEYCLOAK
import Keycloak from "../node_modules/keycloak-js/dist/keycloak";

// ADD API
// import api from "./components/api";

import axios from "axios";

export default Vue.extend({
  name: "App",

  components: {
    User,
    Admin,
    Nav
  },

  data: () => ({
    componentName: "",
    peopleArr: [],
    peopleHeader: ["ID", "Name", "Address", "Phone"],
    role: String,
    headerName: String,
    initOptions: {
      realm: "keycloak-demo",
      url: "http://localhost:8080/auth/",
      clientId: "vue-test-app"
    },
    keycloak: Keycloak()
  }),
  methods: {
    loadPage(): any {
      // THIS IS THE COPIED CODE FROM THE KEYCLOAK ADMINISTRATION CONSOLE. JUST ADAPT IT, SO THAT IT MATHES THIS FORMAT
      this.keycloak = Keycloak(this.initOptions);

      let roles = "";

      this.keycloak
        .init({
          onLoad: "login-required"
        })
        .success((auth: any) => {
          // CHECK IF THE USER IS AUTHENTICATED
          if (!auth) {
            window.location.reload();
          } else {
            console.log("SUCCESSFULLY AUTHENTICATED");

            // CHECK WHAT ROLES THEY HAVE AND DISPLAY THE COMPONENT ACCORDING TO THE ROLE
            roles = JSON.parse(JSON.stringify(this.keycloak.tokenParsed));
            this.role = roles.realm_access.roles;
            this.componentName = String(this.role);

            this.headerName = this.componentName == "admin" ? "light-green darken-2" : "green darken-3";

            //MAKE CALL TO REST SERVICE
            const AXIOS = axios.create({
              baseURL: `/api`,
              timeout: 1000
            });
            AXIOS.get(`http://localhost:9090//people/` + this.role)
              .then(res => {
                console.log(res.data);
                //DISPLAY DATA IN COMPONENT
                this.peopleArr.push(res.data.id);
                this.peopleArr.push(res.data.name);
                if (res.data.address == "" || res.data.address == "") {
                  this.peopleArr.push("CONFIDENTIAL");
                  this.peopleArr.push("CONFIDENTIAL");
                }
              })
              .catch(error => {
                this.errors.push(error);
              });
          }

          // SET THE TOKEN IN THE LOCALSTORAGE
          localStorage.setItem("vue-token", String(this.keycloak.token));
          localStorage.setItem(
            "vue-refresh-token",
            String(this.keycloak.refreshToken)
          );

          // HANDLE TOKEN TIMEOUT
          setTimeout(() => {
            this.keycloak
              .updateToken(70)
              .success(refreshed => {
                if (refreshed) {
                  console.log("Token Refreshed");
                } else {
                  console.log("Token Not Refreshed");
                }
              })
              .error(() => {
                console.log("Failed To Refresh Token");
              });
          }, 60000);
        })
        .error(() => {
          console.log("AUTHENTICATION FAILED");
        });
    }
  },
  mounted() {
    this.loadPage();
  }
});
</script>
