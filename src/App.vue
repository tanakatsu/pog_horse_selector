<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <span>POG horse selector</span>
      </div>

      <v-spacer></v-spacer>

      <v-btn text to="/home">Home</v-btn>
      <v-btn text to="/group" v-if="isLogined()">Group</v-btn>
      <v-btn text to="/download" v-if="isLogined()">Download</v-btn>
      <v-btn text to="/logout" v-if="isLogined()">Logout</v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'App',

  data: () => ({
    //
  }),

  methods: {
    logout: function() {
      firebase.auth().signOut().then(() => {
        this.$store.dispatch('clear_data')
        this.$route.replace('login')
      })
    },
    isLogined: function() {
      return firebase.auth().currentUser
    },
  }
};
</script>
