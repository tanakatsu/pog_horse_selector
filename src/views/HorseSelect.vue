<template>
  <v-container>
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
    <v-dialog v-model="showInputDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">登録</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="3">
              <v-text-field v-model.number="horse.id" label="ID" required />
            </v-col>
            <v-col cols="9">
              <v-text-field v-model="horse.name" label="馬名" required />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="horse.sire" label="父" required />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="horse.mare" label="母" required />
            </v-col>
          </v-row>
          <v-row>
            <div class="mx-3">
              オーナー
              <v-radio-group v-model="owner_name" row>
                <v-radio v-for="(owner, index) in sorted_owners" :label="owner.name" :value="owner.name" :key="index"></v-radio>
              </v-radio-group>
            </div>
          </v-row>
        </v-card-text>
        <div class="text-center" v-show="processing">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <v-card-actions>
          <v-spacer />
            <v-btn @click="closeInputDialog">閉じる</v-btn>
            <v-btn class="primary" @click="addHorse">登録する</v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import firebase from 'firebase'
import { mapActions, mapGetters, mapState } from 'vuex'
const horse_catalogue = require("../assets/horse_catalogue.json")

export default {
  //name: 'HorseSelect', // .vueファイルの場合は自動でファイル名がname属性になるため不要
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
          this.owner_name = ""
          this.closeInputDialog()
        }
      })
    },
    nextHorseNo: function(owner) {
      return (owner in this.ownerHorseCount) ? this.ownerHorseCount[owner] + 1: 1
    },
    validateHorseName: function(horseName) {
      if (horseName === '') {
        return false
      }

      // すでに選択済みの馬は選べない
      const selected_name_list = this.selected_horses.map(horse => horse.name)
      const selected_mare_list = this.selected_horses.map(horse => horse.mare)

      if (selected_name_list.includes(horseName) || selected_mare_list.includes(horseName)) {
        return false
      }
      return true
    },
    validateMareName: function(mareName) {
      if (mareName === '') {
        return false
      }

      // すでに選択済みの馬は選べない
      const selected_mare_list = this.selected_horses.map(horse => horse.mare)
      if (selected_mare_list.includes(mareName)) {
        return false
      }
      return true
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
</style>
