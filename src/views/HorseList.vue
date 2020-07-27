<template>
  <v-container>
    <v-row class="justify-center mt-2">
      <v-col class="mb-5" cols="10">
        <v-card>
          <v-card-title>
            {{this.$route.params.owner_name}}'s horse list
            <v-spacer />
            <v-text-field v-model="search" append-icon="mdi-magnify" label="検索" single-line />
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="owner_horses"
            :items-per-page="10"
            :search="search"
            sort-by="po_order_no"
            :sort-desc="false"
            class="elevation-1"
            >
            <template v-slot:top>
              <v-dialog v-model="showInputDialog" max-width="500px">
                <v-card>
                  <validation-observer v-slot="{ invalid }" immediate>
                    <v-card-title>
                      <span class="headline">編集</span>
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="3">
                          <validation-provider rules="isHorseId" name="ID" v-slot="{ errors }">
                            <v-text-field v-model="horse.id" label="ID" required :error-messages="errors" />
                          </validation-provider>
                        </v-col>
                        <v-col cols="9">
                          <validation-provider rules="required|min:2|isUniqueHorseName" name="馬名" v-slot="{ errors }">
                            <v-text-field v-model="horse.name" label="馬名" required :error-messages="errors" />
                          </validation-provider>
                        </v-col>
                        <v-col cols="5">
                          <validation-provider rules="required|min:2" name="父" v-slot="{ errors }">
                            <v-text-field v-model="horse.sire" label="父" required :error-messages="errors" />
                          </validation-provider>
                        </v-col>
                        <v-col cols="5">
                          <validation-provider rules="required|min:2|isUniqueMare" name="母" v-slot="{ errors }">
                            <v-text-field v-model="horse.mare" label="母" required :error-messages="errors" />
                          </validation-provider>
                        </v-col>
                        <v-col cols="2">
                          <validation-provider rules="required|numeric|min_value:1" name="No" v-slot="{ errors }">
                            <v-text-field v-model="horse.po_order_no" label="No" required :error-messages="errors" />
                          </validation-provider>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <div class="text-center" v-show="processing">
                      <v-progress-circular indeterminate color="primary" />
                    </div>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn @click="closeInputDialog">閉じる</v-btn>
                      <v-btn class="primary" @click="updateHorse" :disabled="invalid">更新する</v-btn>
                      <v-spacer />
                    </v-card-actions>
                  </validation-observer>
                </v-card>
              </v-dialog>
              <v-dialog v-model="showConfirmDialog" max-width="500px">
                <v-card>
                  <v-card-title>確認</v-card-title>
                  <v-card-text>
                    {{ horse.name }} を削除してもよいですか?
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" text @click="closeConfirmDialog">キャンセル</v-btn>
                    <v-btn color="primary" text @click="doDelete">はい</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon small @click="edit(item)">mdi-pencil</v-icon>
              <v-icon small @click="remove(item)">mdi-delete</v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from 'firebase'
import { mapActions, mapState } from 'vuex'
import { required, regex, min, numeric, min_value } from 'vee-validate/dist/rules'
import { localize, extend, ValidationObserver, ValidationProvider } from 'vee-validate'
import ja from 'vee-validate/dist/locale/ja.json'
extend('required', required)
extend('regex', regex)
extend('min', min)
extend('numeric', numeric)
extend('min_value', min_value)
localize('ja', ja)


export default {
  name: "HorseList",
  components: {
    ValidationObserver,
    ValidationProvider,
  },
  data() {
    return {
      horse: {},
      orig_horse: {},
      owner_name: null,
      owner_horses: [],
      search: null,
      headers: [
        { text: 'No', value: 'po_order_no' },
        { text: 'ID', value: 'id' },
        { text: '馬名', value: 'name' },
        { text: '父', value: 'sire' },
        { text: '母', value: 'mare' },
        { text: '操作', value: 'actions' },
      ],
      processing: false,
      showInputDialog: false,
      showConfirmDialog: false,
    }
  },
  methods: {
    edit: function(horse) {
      this.horse = Object.assign({}, horse)
      this.orig_horse = Object.assign({}, horse)
      this.showInputDialog = true
    },
    remove: function(horse) {
      this.horse = Object.assign({}, horse)
      this.orig_horse = Object.assign({}, horse)
      this.showConfirmDialog = true
    },
    closeInputDialog: function() {
      this.showInputDialog = false
    },
    closeConfirmDialog: function() {
      this.showConfirmDialog = false
    },
    updateHorse: function() {
      const data_id = this.horse.key
      const currentUser = firebase.auth().currentUser
      const target_year = this.$target_year
      this.processing = true

      firebase.database().ref('horse').child(currentUser.uid).child(target_year).child(data_id).update({
        id: this.horse.id,
        name: this.horse.name,
        sire: this.horse.sire,
        mare: this.horse.mare,
        po_order_no: parseInt(this.horse.po_order_no),
      }, (err) => {
        if (err) {
          alert(err)
        }
        this.processing = false
        this.closeInputDialog()
      })
    },
    doDelete: function() {
      const data_id = this.horse.key
      this.processing = true

      const currentUser = firebase.auth().currentUser
      const target_year = this.$target_year
      firebase.database().ref('horse').child(currentUser.uid).child(target_year).child(data_id).remove((err) => {
        if (err) {
          alert(err)
        }
        this.processing = false
        this.closeConfirmDialog()
      })
    },
    get_owner_horses: function() {
      this.owner_horses = this.selected_horses.filter(horse => {
        if (horse.po_name === this.owner_name) {
          return true
        } else {
          return false
        }
      })
      this.owner_horses = this.owner_horses.sort((horse1, horse2) => {
        return horse1.po_order_no - horse2.po_order_no
      })
    },
    ...mapActions([
      'fetch_data',
    ])
  },
  created() {
    this.owner_name = this.$route.params.owner_name
    this.get_owner_horses()

    // https://dev.to/viniciuskneves/watch-for-vuex-state-changes-2mgj
    this.$store.watch(
      (state) => state.selected_horses,
      () => {
        this.get_owner_horses()
      })

    this.fetch_data()

    // インスタンス変数を利用するルールを追加
    extend('isHorseId', (value) => {
      const pattern = `^${this.$target_year - 2}[0-9]{6}$`
      const re = new RegExp(pattern, "g")
      return re.test(value) || `{_field_} は ${this.$target_year - 2} で始まる10桁の数字です`
    })
    extend('isUniqueMare', (value) => {
      const taken_names = this.selected_horses.map(h => h.mare).filter(name => name !== this.orig_horse.mare)
      if (taken_names.includes(value)) {
        return '{_field_}はすでに使われています'
      } else {
        return true
      }
    })
    extend('isUniqueHorseName', (value) => {
      const taken_names = this.selected_horses.map(h => h.name).filter(name => name !== this.orig_horse.name)
      if (taken_names.includes(value)) {
        return '{_field_}はすでに使われています'
      } else {
        return true
      }
    })
  },
  computed: {
    ...mapState([
      'selected_horses'
    ])
  },
  watch: {
  }
}
</script>

<style scoped>
</style>
