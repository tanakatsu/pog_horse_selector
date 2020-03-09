import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import firebase from 'firebase'
import moment from 'moment'

Vue.config.productionTip = false

// vuejs-dialog
import VuejsDialog from 'vuejs-dialog'
import 'vuejs-dialog/dist/vuejs-dialog.min.css'
Vue.use(VuejsDialog)

// https://stackoverflow.com/questions/49256765/change-vue-prototype-variable-in-all-components
// let globalData = new Vue({
//   data: { $selected_horses: [] }
// })
// Vue.mixin({
//   computed: {
//     $selected_horses: {
//       get: function() { return globalData.$data.$selected_horses },
//       set: function(newVal) { globalData.$data.$selected_horses = newVal }
//     }
//   }
// })

Vue.prototype.$target_year = process.env.VUE_APP_TARGET_YEAR || moment().year()

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDR_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//firebase.analytics();

// new Vue({
//   router,
//   render: h => h(App)
// }).$mount('#app')

let app = ''
firebase.auth().onAuthStateChanged(() => {
  if (!app) {
    app = new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  }
})
