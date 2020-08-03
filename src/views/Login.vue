<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="6">
        <v-card class="mx-auto mt-5">
          <v-card-title>
            <h1 class="display-1">ログイン</h1>
          </v-card-title>
          <v-card-text>
            <validation-observer v-slot="{ invalid }">
              <v-form>
                <validation-provider rules="required|email" name="メールアドレス" v-slot="{ errors, valid }">
                  <v-text-field label="メールアドレス" v-model="email" prepend-icon="mdi-account-circle" required :error-messages="errors" :success="valid"></v-text-field>
                </validation-provider>
                <validation-provider rules="required" name="パスワード" v-slot="{ errors, valid }">
                  <v-text-field label="パスワード" v-bind:type="showPassword ? 'text': 'password'" prepend-icon="mdi-lock" @click:append="showPassword = !showPassword" v-bind:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" v-model="password" required :error-messages="errors" :success="valid"></v-text-field>
                </validation-provider>
                <v-card-actions class="justify-center">
                  <v-btn class="info" @click="login" :disabled="processing || invalid">ログイン</v-btn>
                </v-card-actions>
                <div class="text-center">
                  <span>You don't have an account ? You can <router-link to="/signup">create one</router-link></span>
                </div>
                <div class="text-center" v-show="processing">
                  <v-progress-circular indeterminate color="primary" />
                </div>
              </v-form>
            </validation-observer>
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
        showPassword: false
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
</style>
