<template>
  <div class="hello">
    <h1>Horse select tool</h1>
    <p>
      <input v-model="selected_horsename" type="textbox" list="horses" placeholder="馬名/母名を入力してください" size=30 />
      <datalist id="horses">
        <option v-for="(suggested_horse, index) in suggested_horses" v-bind:value="suggested_horse.name" v-bind:key="index">
          {{ suggested_horse.name }}
          （父{{ suggested_horse.sire }}
          母{{ suggested_horse.mare }}）
        </option>
      </datalist>
      <button v-bind:disabled="this.selected_horsename === ''" v-on:click="selectHorse">Select</button>
    </p>
    <p>
      <input type="radio" id="by_marename" v-bind:value="true" v-model="search_by_marename">
      <label for="by_marename">母名優先</label>
      <input type="radio" id="by_horsename" v-bind:value="false" v-model="search_by_marename">
      <label for="by_horsename">馬名優先</label>
    </p>

    <div>
      <li v-for="(owner, index) in owners" :key='index'>
        {{ owner }}
          <span v-if="owner in ownerHorseCount">
            <router-link :to="{name: 'horselist', params: {owner_name: owner}}">{{ ownerHorseCount[owner] }}</router-link>
          </span>
          <span v-else>0</span>
      </li>
    </div>

    <HorseInputModal @close="closeModal" v-if="showModal">
      <!-- default スロットコンテンツ -->
      <div>
        <div>
          馬名<input v-model="tmp_horse_name" :disabled="tmp_horse_id !== null">
        </div>
        <div>
          父<input v-model="tmp_horse_sire" :disabled="tmp_horse_id !== null">
        </div>
        <div>
          母<input v-model="tmp_horse_mare" :disabled="tmp_horse_id !== null">
        </div>
        <div>
          オーナー
          <br>
          <label v-for="(owner, index) in owners" :key="index">
            <input v-model="selected_ownername" :value="owner" :key="index" type="radio" />
            {{owner}}
            <br>
          </label>
        </div>
      </div>
      <!-- /default -->
      <!-- footer スロットコンテンツ -->
      <template slot="footer">
        <button @click="doSend" :disabled="selected_ownername === '' || processing">送信</button>
        <button @click="closeModal" :disabled="processing">キャンセル</button>
      </template>
      <!-- /footer -->
    </HorseInputModal>
  </div>
</template>

<script>
import firebase from 'firebase'
import { mapActions, mapGetters, mapState } from 'vuex'
import HorseInputModal from '@/components/HorseInputModal.vue'
const horse_catalogue = require("../assets/horse_catalogue.json")
const owner_names = require("../assets/owners.json")

export default {
  //name: 'HorseSelect', // .vueファイルの場合は自動でファイル名がname属性になるため不要
  components: { HorseInputModal },
  data() {
    return {
      horses: horse_catalogue,
      owners: owner_names,
      suggested_horses: [],
      selected_horsename: "",
      selected_ownername: "",
      showModal: false,
      tmp_horse_name: "",
      tmp_horse_sire: "",
      tmp_horse_mare: "",
      tmp_horse_id: null,
      search_by_marename: true,
      processing: false
    }
  },
  methods: {
    searchHorses: function(searchWord) {
      if (this.search_by_marename) {
        const mare_matched = this.horses.filter(function(horse) {
          if (horse.po_name) {
            return false
          }
          // TODO: indexOfの位置でソート
          return horse.mare.indexOf(searchWord) === 0
        })
        return mare_matched
      } else {
        const matched = this.horses.filter(function(horse) {
          if (horse.po_name) {
            return false
          }
          // TODO: indexOfの位置でソート
          // return horse.name.indexOf(searchWord) === 0
          return horse.name.indexOf(searchWord) >= 0
        })
        return matched
      }
    },
    selectHorse: function() {
      const targetHorse = this.horses.find(horse => {
        if (horse.name === this.selected_horsename) {
          return true
        }
      })
      if (targetHorse) {
        this.tmp_horse_name = targetHorse.name
        this.tmp_horse_sire = targetHorse.sire
        this.tmp_horse_mare = targetHorse.mare
        this.tmp_horse_id = targetHorse.id
      } else {
        this.tmp_horse_name = this.selected_horsename
        this.tmp_horse_sire = ""
        this.tmp_horse_mare = ""
        this.tmp_horse_id = null
      }
      this.openModal()
    },
    openModal: function() {
      this.showModal = true
    },
    closeModal: function() {
      this.showModal = false
    },
    doSend: function() {
      const newHorse = {id: this.tmp_horse_id, name: this.tmp_horse_name, sire: this.tmp_horse_sire, mare: this.tmp_horse_mare, po_name: this.selected_ownername, po_order_no: this.nextHorseNo(this.selected_ownername)}
      this.processing = true

      firebase.database().ref('horse').push(newHorse, (err) => {
        this.processing = false

        if (err) {
          alert(err)
        } else {
          this.selected_horsename = ""
          this.selected_ownername = ""
          this.closeModal()
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
  },
  watch: {
    selected_horsename: function(val) {
      // console.log(`val=${val}`)
      if (val === "") {
        this.suggested_horses = []
        return
      }
      this.suggested_horses = this.searchHorses(val)
      this.suggested_horses = this.suggested_horses.slice(0, 5)  // clipping
    },
  },
  computed: {
    ...mapGetters([
      'ownerHorseCount'
    ]),
    ...mapState([
      'selected_horses'
    ])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>