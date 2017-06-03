<template>
  <div id="app">
    <img src="./assets/logo.png">
    <drawable></drawable>
  </div>
</template>

<script>
import Drawable from './components/Drawable'

export default {
  name: 'app',
  components: {
    Drawable
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
