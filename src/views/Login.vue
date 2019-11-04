<template>
  <div class="login">
    <h3>Sigin In</h3>
    <input type="text" v-model="email" placeholder="Email"><br>
    <input type="password" v-model="password" placeholder="Password"><br>
    <div v-show="processing">Processing...</div>
    <button @click="login" :disabled="processing">Connection</button>
    <p>You don't have an account ? You can <router-link to="/signup">create one</router-link></p>
  </div>
</template>

<script>
  import firebase from 'firebase'

  export default {
    name: 'login',
    data() {
      return {
        email: '',
        password: '',
        processing: false
      };
    },
    methods: {
      login: function() {
        this.processing = true
        firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(
          () => {
            // alert('Well done ! You are now connected')
            this.processing = false
            this.$router.replace('home')
          },
          (err) => {
            alert('Oops. ' + err.message)
            this.processing = false
          }
        )
      }
     }
  }
</script>

<style scoped>
  .login {
    margin-top: 40px;
  }
  input {
    margin: 10px 0;
    width: 20%;
    padding: 15px;
  }
  button {
    margin-top: 20px;
    width: 10%;
    cursor: pointer;
  }
  p {
    margin-top: 40px;
    font-size: 13px;
  }
  p a {
    text-decoration: underline;
    cursor: pointer;
  }
</style>
