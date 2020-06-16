<template>
  <div id="app">
    <div id="nav">
      <router-link to="/home">Home</router-link> |
      <router-link to="/about">About</router-link>
      <span v-if="isLogined()"> | </span>
      <router-link to="/group" v-if="isLogined()">Group</router-link>
      <span v-if="isLogined()"> | </span>
      <router-link to="/download" v-if="isLogined()">Download</router-link>
      <span v-if="isLogined()"> | </span>
      <router-link @click.native="logout" to="/login" exact v-if="isLogined()">Logout</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  methods: {
    logout: function() {
      firebase.auth().signOut().then(() => {
        this.$store.dispatch('clear_data')
        this.$router.replace('login')
      })
    },
    isLogined: function() {
      return firebase.auth().currentUser
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
