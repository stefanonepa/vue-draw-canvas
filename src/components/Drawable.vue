<template>
  <div class="flex">

    <div>
      <h2>Canvas properties</h2>
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
            <input type="text" v-model="canvasWidth">
          </li>
          <li>
            <label>Height: </label>
            <input type="text" v-model="canvasHeight">
          </li>
        </ul>
      </div>

      <div>
        <h3>Points properties:</h3>
        <label>Point Size</label>
        <input type="number" v-model.number="pointSize">
      </div>
    </div>

    <div>
      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"

        @mousedown="mousedown"
        @mouseup="mouseup"
        @mousemove="mousemove"
      ></canvas>
    </div>

    <div>
      <h3>Points (data)</h3>
      <table  class="ui selectable table">
        <thead>
          <tr><th>N°</th><th>X</th><th>Y</th><th>Remove</th></tr>
        </thead>
        <tbody>
          <tr v-for="(point, index) in points" :key="point">
            <td>{{index + 1}}</td>
            <td>{{point.x}}</td>
            <td>{{point.y}}</td>
            <td><button @click="removePoint(index)">X</button></td>
            </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h3>Test data</h3>
      <label>OverPoint:</label>
      <pre>{{overPoint}}</pre>
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

      overPoint: null,
      dragMode: false,

      pointSize: 7,
      strokeStyle: 'darkgrey',
      fillStyle: '#fff',
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 100, y: 200 },
        { x: 200, y: 200 }
      ]
    }
  },
  computed: {

  },
  methods: {
    removePoint (index) {
      this.points.splice(index, 1)
      this.clear()
      this.drawAllNodes()
    },
    matchPoints (checkPoint, mousePoint) {
      if (mousePoint.x > checkPoint.x + this.pointSize) {
        return false
      }

      if (mousePoint.x < checkPoint.x - this.pointSize) {
        return false
      }

      if (mousePoint.y > checkPoint.y + this.pointSize) {
        return false
      }

      if (mousePoint.y < checkPoint.y - this.pointSize) {
        return false
      }
      return true
    },
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
    mouseup (event) {
      let mouseUpPoint = this.getMousePos(event)
      if (this.dragMode && this.overPoint) {
        this.dragPoint(this.overPoint, mouseUpPoint)
        this.dragMode = false
      } else {
        this.addNode(mouseUpPoint)
      }
    },
    dragPoint (selectedPoint, newPoint) {
      this.points.map((pointToMove) => {
        if (pointToMove.x === selectedPoint.x && pointToMove.y === selectedPoint.y) {
          pointToMove.x = newPoint.x
          pointToMove.y = newPoint.y

          this.clear()
          this.drawAllNodes()
        }
      })
    },
    mousemove (event) {
      let point = this.getMousePos(event)
      // this.selectedPoint(point)
      if (this.dragMode && this.overPoint) {
        this.dragPoint(this.overPoint, point)
      }
    },
    mousedown (event) {
      let point = this.getMousePos(event)
      if (this.isMouseOnNode(point)) {
        // point selected
        this.dragMode = true
      } else {
        this.dragMode = false
      }
    },
    isMouseOnNode (point) {
      return this.selectedPoint(point) !== null
    },
    selectedPoint (point) {
      for (var iteratedPoint of this.points) {
        if (this.matchPoints(iteratedPoint, point)) {
          this.overPoint = iteratedPoint
          return iteratedPoint
        }
      }
      this.overPoint = null
      return null
    },
    addNode (point) {
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
