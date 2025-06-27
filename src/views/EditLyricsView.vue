<template>
  <div class="min-h-screen bg-black text-white p-6 flex flex-col justify-between">
    <div>
      <br>
      <br>
      <h1 class="text-xl font-bold mb-4">Edit lyric</h1>
      <textarea
        v-model="editableLyrics"
        :maxlength="1000"
        class="w-full h-[400px] text-black p-4 rounded-md text-base font-medium border-2 border-blue-500 focus:outline-none"
      ></textarea>
    </div>

    <div class="flex justify-end mt-4">
      <button
        @click="saveToState"
        class="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        :disabled="!isValid"
      >
        <i class="fas fa-save mr-2"></i>
        Save
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      editableLyrics: '',
    };
  },
  computed: {
    isValid() {
      return this.editableLyrics.trim().length > 0 &&
        this.editableLyrics.length <= 1000;
    },
  },
  mounted() {
    // Load from localStorage
    const saved = localStorage.getItem('lyrics_before_edit');
    if (saved) {
      this.editableLyrics = saved;
    }
  },
  methods: {
    saveToState() {
      localStorage.setItem('lyrics_after_edit', this.editableLyrics);

      // Navigate back
      this.$router.push({
        name: 'generate-lyrics-genre'
      });
    }
  }
}
</script>
