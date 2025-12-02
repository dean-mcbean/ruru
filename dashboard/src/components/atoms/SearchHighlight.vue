<template>
  <span v-html="highlightedText"></span>
</template>

<script>
export default {
  name: 'SearchHighlight',
  props: {
    text: {
      type: String,
      required: true
    },
    query: {
      type: String,
      default: ''
    }
  },
  computed: {
    highlightedText() {
      if (!this.query) return this.escapeHtml(this.text);
      const regex = new RegExp(`(${this.escapeRegExp(this.query)})`, 'gi');
      return this.escapeHtml(this.text).replace(
        regex,
        '<mark>$1</mark>'
      );
    }
  },
  methods: {
    escapeHtml(text) {
      return text.replace(/[&<>"']/g, function (m) {
        return ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        })[m];
      });
    },
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
};
</script>