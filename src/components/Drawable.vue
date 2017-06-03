<template>
  <div>
    <h1>This is a drawable canvas</h1>
    <div>
      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"

        @mousedown="addNode"
        ></canvas>
      <div>
        <input type="text" v-model="canvasWidth" />
        <input type="text" v-model="canvasHeight" />
        <input type="number" v-model.number="pointSize" />
        <button @click="drawNodes">drawAllNodes</button>
        <button @click="clear">clear</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted () {
    this.canavas = this.$refs.canvas
    this.context = this.$refs.canvas.getContext('2d')
  },
  data () {
    return {
      canvas: {},
      context: {},
      canvasHeight: 350,
      canvasWidth: 450,

      pointSize: 4,
      color: 'red',
      backgroundColor: 'green',
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
    getMousePos (evt) {
      var rect = this.context.canvas.getBoundingClientRect()
      return {
        x: parseInt(evt.clientX - rect.left),
        y: parseInt(evt.clientY - rect.top)
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
      this.context.fillStyle = this.backgroundColor
      this.context.fill()
      this.context.strokeStyle = this.color
      this.context.stroke()
    },
    drawNodes () {
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
    border:1px solid #BBB;
  }
</style>
