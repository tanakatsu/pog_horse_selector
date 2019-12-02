<template>
  <div>
    <h1>CSV Download</h1>
    <button :disabled="this.selected_horses.length === 0" @click="downloadCSV">Download</button>
  </div>
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
      let csv = '\ufeff' + 'owner_name,name,sire,mare,id\n'
      this.selected_horses.forEach(el => {
        const line = `${el['po_name']},${el['name']},${el['sire']},${el['mare']},${el['id']}\n`
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
