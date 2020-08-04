<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="6">
        <v-card class="mx-auto mt-5">
          <v-card-title>
            <h1 class="display-1">サインアップ</h1>
          </v-card-title>
          <v-card-text>
            <validation-observer v-slot="{ handleSubmit }">
              <v-form @submit.prevent="handleSubmit(signUp)">
                <validation-provider rules="required|email" name="ユーザ名" v-slot="{ errors }">
                  <v-text-field label="ユーザ名" prepend-icon="mdi-account-circle" required :error-messages="errors" v-model="email"/>
                </validation-provider>
                <validation-provider rules="required" name="パスワード" v-slot="{ errors }">
                  <v-text-field label="パスワード" v-bind:type="showPassword ? 'text': 'password'" prepend-icon="mdi-lock" @click:append="showPassword = !showPassword" v-bind:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :error-messages="errors" v-model="password" />
                </validation-provider>
                <v-card-actions class="justify-center">
                  <v-btn class="info" type="submit" :disabled="processing">サインアップ</v-btn>
                </v-card-actions>
              </v-form>
            </validation-observer>
            <div class="text-center">
              <span>or go back to <router-link to="/login">login</router-link></span>
            </div>
            <div class="text-center">
              <v-progress-circular
                indeterminate
                color="primary" v-if="processing">
              </v-progress-circular>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import firebase from 'firebase'
  import { required, email } from 'vee-validate/dist/rules'
  import { localize, extend, ValidationObserver, ValidationProvider } from 'vee-validate'
  import ja from 'vee-validate/dist/locale/ja.json'
  extend('required', required)
  extend('email', email)
  localize('ja', ja)

  export default {
    components: {
      ValidationObserver,
      ValidationProvider,
    },
    data() {
      return {
        email: '',
        password: '',
        processing: false,
        showPassword: false,
      }
    },
    methods: {
      signUp: function() {
        this.processing = true
        firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(
          // onResolve
          () => {
            // alert('Your account has been created !')
            this.processing = false
            this.$router.replace('home')
          },
          // onReject
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
</style>

