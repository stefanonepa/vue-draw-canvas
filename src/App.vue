<template>
  <div id="app" class="ui">
    <h1>This is a drawable canvas with <img src="./assets/logo.png" width="30px" /></h1>
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
  color: #2c3e50;
  margin-top: 20px;
}
</style>
