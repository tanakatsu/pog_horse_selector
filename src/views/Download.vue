<template>
  <v-container>
    <div class="text-center">
      <h1 class="mb-5">CSV Download</h1>
      <v-btn :disabled="this.selected_horses.length === 0" @click="downloadCSV">Download</v-btn>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  data() {
    return {
    }
  },
  methods: {
    downloadCSV: function() {
      let csv = '\ufeff' + 'order_no,owner_name,name,sire,mare,id\n'

      const sorted_horses = this.selected_horses.sort(function(a, b) {
        if (a['po_name'] < b['po_name']) {
          return -1
        } else if (a['po_name'] > b['po_name']) {
          return 1
        } else {
          if (a['po_order_no'] < b['po_order_no']) {
            return -1
          } else if (a['po_order_no'] > b['po_order_no']) {
            return 1
          } else {
            return 0
          }
        }
      })
      sorted_horses.forEach(el => {
        const line = `${el['po_order_no']},${el['po_name']},${el['name']},${el['sire']},${el['mare']},${el['id']}\n`
        csv += line
      })
      const blob = new Blob([csv], { type: 'text/csv' })
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'pog_result.csv'
      link.click()
    },
    ...mapActions([
      'fetch_data',
    ])
  },
  created() {
    this.fetch_data()
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
