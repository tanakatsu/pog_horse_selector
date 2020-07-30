<template>
  <v-container>
    <v-row>
      <v-spacer />
      <v-menu>
        <template v-slot:activator="{ on, attrs }">
          <v-icon v-on="on" v-bind="attrs">mdi-cog</v-icon>
        </template>
        <v-list>
          <v-subheader>Max Suggests</v-subheader>
          <v-list-item
            v-for="(item, index) in max_suggests"
            :key="index"
            @click="max_suggest = item"
            >
            <v-list-item-title>{{ item }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-row>
    <v-row class="justify-center">
      <v-col class="mb-5" cols="8">
        <h1 class="mb-5">Horse select</h1>
        <v-autocomplete
          v-model="selected_mare"
          :items="suggested_horses"
          :search-input.sync="search"
          outlined
          clearable
          hide-no-data
          item-text="mare"
          item-value="mare"
          prepend-icon="mdi-database-search"
          label="母名を入力してください"
          @keydown.enter="selectHorse"
          >
          <template v-slot:item="{ item }">
            <v-list-item-content>
              <v-list-item-title v-text="item.name"></v-list-item-title>
              <v-list-item-subtitle>
                父:{{item.sire}} 母:{{item.mare}}
              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
    <v-row justify="space-around">
      <li v-for="(owner, index) in sorted_owners" :key='index'>
        {{ owner.name }}
          <span v-if="owner.name in ownerHorseCount">
            <router-link :to="{name: 'horselist', params: {owner_name: owner.name}}">{{ ownerHorseCount[owner.name] }}</router-link>
          </span>
          <span v-else>0</span>
      </li>
    </v-row>
    <v-dialog v-model="showInputDialog" max-width="500px">
      <v-card>
        <validation-observer v-slot="{ invalid }" immediate>
          <v-card-title>
            <span class="headline">登録</span>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="3">
                <validation-provider :rules="`isHorseId:${$target_year - 2}`" name="ID" v-slot="{ errors }">
                  <v-text-field v-model="horse.id" label="ID" required :error-messages="errors" />
                </validation-provider>
              </v-col>
              <v-col cols="9">
                <validation-provider rules="required|min:2|isUniqueHorseName" name="馬名" v-slot="{ errors }">
                  <v-text-field v-model="horse.name" label="馬名" required :error-messages="errors" />
                </validation-provider>
              </v-col>
              <v-col cols="6">
                <validation-provider rules="required|min:2" name="父" v-slot="{ errors }">
                  <v-text-field v-model="horse.sire" label="父" required :error-messages="errors" />
                </validation-provider>
              </v-col>
              <v-col cols="6">
                <validation-provider rules="required|min:2|isUniqueMare" name="母" v-slot="{ errors }">
                  <v-text-field v-model="horse.mare" label="母" required :error-messages="errors" />
                </validation-provider>
              </v-col>
            </v-row>
            <v-row>
              <div class="mx-3">
                オーナー
                <validation-provider rules="required" name="オーナー" v-slot="{ errors }">
                  <v-radio-group v-model="owner_name" row :error-messages="errors">
                    <v-radio v-for="(owner, index) in sorted_owners" :label="owner.name" :value="owner.name" :key="index"></v-radio>
                  </v-radio-group>
                </validation-provider>
              </div>
            </v-row>
          </v-card-text>
          <div class="text-center" v-show="processing">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <v-card-actions>
            <v-spacer />
              <v-btn @click="closeInputDialog">閉じる</v-btn>
              <v-btn class="primary" @click="addHorse" :disabled="invalid">登録する</v-btn>
            <v-spacer />
          </v-card-actions>
        </validation-observer>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import firebase from 'firebase'
import { mapActions, mapGetters, mapState } from 'vuex'
import { required, regex, min, numeric, min_value } from 'vee-validate/dist/rules'
import { localize, extend, ValidationObserver, ValidationProvider } from 'vee-validate'
import ja from 'vee-validate/dist/locale/ja.json'
const horse_catalogue = require("../assets/horse_catalogue.json")
extend('required', required)
extend('regex', regex)
extend('min', min)
extend('numeric', numeric)
extend('min_value', min_value)
localize('ja', ja)

extend('isHorseId', {
  validate(value, args) {
    const pattern = `^${args.year}[0-9]{6}$`
    const re = new RegExp(pattern, "g")
    return re.test(value) || `{_field_} は ${args.year} で始まる10桁の数字です`
  },
  params: ['year'],
})


export default {
  //name: 'HorseSelect', // .vueファイルの場合は自動でファイル名がname属性になるため不要
  components: {
    ValidationObserver,
    ValidationProvider,
  },
  data() {
    return {
      horses: horse_catalogue,
      suggested_horses: [],
      search: null,
      selected_mare: "",
      horse: {},
      owner_name: null,
      showInputDialog: false,
      processing: false,
      max_suggest: 5,
      max_suggests: [3, 5, 8, 10],
    }
  },
  methods: {
    searchHorses: function(searchWord) {
      const mare_matched = this.horses.filter(function(horse) {
        if (horse.po_name) {
          return false
        }
        // TODO: indexOfの位置でソート
        return horse.mare.indexOf(searchWord) === 0
      })
      return mare_matched
    },
    selectHorse: function() {
      if (!this.search) {
        return
      }
      if (this.search !== this.selected_mare) {
        // データベースに存在しない場合
        this.horse = {
          name: "",
          sire: "",
          mare: this.search,
          id: null,
        }
      } else {
        // データベースに存在する場合
        const targetHorse = this.horses.find(horse => {
          if (horse.mare === this.selected_mare) {
            return true
          }
        })
        this.horse = {
          name: targetHorse.name,
          sire: targetHorse.sire,
          mare: targetHorse.mare,
          id: targetHorse.id,
        }
      }
      this.showInputDialog = true
    },
    closeInputDialog: function() {
      this.owner_name = null
      this.showInputDialog = false
    },
    addHorse: function() {
      const currentUser = firebase.auth().currentUser
      const uid = currentUser.uid
      const target_year = this.$target_year
      this.horse.po_name = this.owner_name
      this.horse.po_order_no = this.nextHorseNo(this.owner_name)
      this.processing = true

      firebase.database().ref('horse').child(uid).child(target_year).push(this.horse, (err) => {
        this.processing = false

        if (err) {
          alert(err)
        } else {
          this.horse = {}
          this.selected_mare = ""
          this.closeInputDialog()
        }
      })
    },
    nextHorseNo: function(owner) {
      return (owner in this.ownerHorseCount) ? this.ownerHorseCount[owner] + 1: 1
    },
    ...mapActions([
      'fetch_data',  // this.fetch_data() を this.$store.dispatch('fetch_data') にマッピングする
    ])
  },
  created() {
    // Add flag
    this.horses = this.horses.map(function(data) {
      return Object.assign(data, {po_name: null, po_order_no: null})
    })

    this.fetch_data()

    // インスタンス変数を利用するルールを追加
    extend('isUniqueMare', (value) => {
      const taken_names = this.selected_horses.map(h => h.mare)
      if (taken_names.includes(value)) {
        return '{_field_}はすでに使われています'
      } else {
        return true
      }
    })
    extend('isUniqueHorseName', (value) => {
      const taken_names = this.selected_horses.map(h => h.name)
      if (taken_names.includes(value)) {
        return '{_field_}はすでに使われています'
      } else {
        return true
      }
    })
  },
  watch: {
    search: function(val) {
      // console.log(`search=${val}`)
      if (val === "") {
        this.suggested_horses = []
        return
      }
      this.suggested_horses = this.searchHorses(val)

      // すでに選ばれている馬は除外する
      const selected_mare_list = this.selected_horses.map(horse => horse.mare)
      this.suggested_horses = this.suggested_horses.filter(horse => !selected_mare_list.includes(horse.mare))

      this.suggested_horses = this.suggested_horses.slice(0, this.max_suggest)  // clipping
    },
  },
  computed: {
    ...mapGetters([
      'ownerHorseCount',
      'sorted_owners'
    ]),
    ...mapState([
      'selected_horses',
      'owners'
    ]),
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li { list-style-type: none }
</style>
