<script>
export default {
  methods: {
    goToChordProgression() {
      this.$router.push('/progression');
    }
  }
}
</script>

<template>
  <div class="body">
    <header class="app-header">
      <div class="tab-selector">
        <button class="tab-button" @click="goToChordProgression">CHORD PROGRESSION</button>
        <button class="tab-button active">MELODY CREATOR</button>
      </div>
    </header>
    
    <div class="content">
      <h2>Melody Creator</h2>
      <p>Melody creator features coming soon...</p>
    </div>
  </div>
</template>

<style scoped>
.body {
  text-align: center;
  min-height: 100vh;
  background-color: #1b1b1b;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}

.tab-selector {
  display: inline-flex;
  background-color: #333;
  border-radius: 30px;
  padding: 5px;
  margin: 30px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.tab-button {
  padding: 12px 30px;
  background: transparent;
  color: #fff;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  letter-spacing: 1px;
  font-size: 14px;
}

.tab-button.active {
  background-color: #fff;
  color: #000;
}

.content {
  width: 95%;
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}

h2 {
  font-family: 'Avalors Personal Use';
  font-size: 40px;
  text-shadow: 0 0 4px white;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  color: #ccc;
}
</style>
