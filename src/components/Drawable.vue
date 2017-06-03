<template>
  <div class="flex">

    <div>
      <h2>Canavas properties</h2>
      <div>
        <h3>Actions:</h3>
        <button @click="drawAllNodes">drawAllNodes</button>
        <button @click="clear">clear canvas (not points)</button>
        <button @click="clearPoints">clear points</button>
      </div>

      <div>
        <h3>Size:</h3>
        <ul>
          <li>
            <label>Width: </label>
            <input type="text" v-model="canvasWidth" />
          </li>
          <li>
            <label>Height: </label>
            <input type="text" v-model="canvasHeight" />
          </li>
        </ul>
      </div>

      <div>
        <h3>Points properties:</h3>
        <label>Point Size</label>
        <input type="number" v-model.number="pointSize" />
      </div>
    </div>

    <div>
      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"

        @mousedown="addNode"
      ></canvas>
    </div>

    <div>
      <h3>Points (data)</h3>
      <table  class="ui selectable table">
        <thead>
          <tr><th>N°</th><th>X</th><th>Y</th></tr>
        </thead>
        <tbody>
          <tr v-for="(point, index) in points">
            <td>{{index + 1}}</td>
            <td>{{point.x}}</td>
            <td>{{point.y}}</td>
            </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  mounted () {
    this.canvas = this.$refs.canvas
    this.context = this.canvas.getContext('2d')
    this.drawAllNodes()
  },
  data () {
    return {
      canvas: {},
      context: {},
      canvasHeight: 350,
      canvasWidth: 450,

      pointSize: 4,
      strokeStyle: 'red',
      fillStyle: 'green',
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 100, y: 200 },
        { x: 200, y: 200 }
      ]
    }
  },
  methods: {
    clear () {
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    },
    clearPoints () {
      this.points = []
      this.clear()
    },
    getMousePos (evt) {
      // https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
      var rect = this.context.canvas.getBoundingClientRect()
      return {
        x: parseInt((evt.clientX - rect.left) / (rect.right - rect.left) * this.canvasWidth),
        y: parseInt((evt.clientY - rect.top) / (rect.bottom - rect.top) * this.canvasHeight)
      }
    },
    addNode (event) {
      let point = this.getMousePos(event)
      this.context.save()
      this.drawNode(point)
      this.context.restore()
      this.points.push(point)
    },
    drawNode (point) {
      this.context.beginPath()
      this.context.moveTo(point.x - this.pointSize, point.y - this.pointSize)
      this.context.lineTo(point.x - this.pointSize, point.y + this.pointSize)
      this.context.lineTo(point.x + this.pointSize, point.y + this.pointSize)
      this.context.lineTo(point.x + this.pointSize, point.y - this.pointSize)
      this.context.lineTo(point.x - this.pointSize, point.y - this.pointSize)
      this.context.fillStyle = this.fillStyle
      this.context.fill()
      this.context.strokeStyle = this.strokeStyle
      this.context.stroke()
    },
    drawAllNodes () {
      this.context.save()
      for (let point of this.points) {
        this.drawNode(point)
      }
      this.context.restore()
    }
  }
}
</script>
<style>
  canvas {
    border:1px solid #bbb;
  }
  .flex{
    display: flex;
    flex-flow: row wrap;
  }
  .flex > * {
    border: 1px solid #eee;
    margin: 10px;
    padding: 10px;
  }
</style>
