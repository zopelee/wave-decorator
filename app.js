var opt = WavingSetting

var container = new PIXI.Container()
var renderer = new PIXI.CanvasRenderer(opt.canvas.width, opt.canvas.height, {view: document.getElementById('waving_canvas'), transparent: true})
var gphs = []
var mirrorGphs = []
for (var i = 0, len = opt.wave.layers.length; i < len; i++) {
  var gph = new PIXI.Graphics()
  var mirrorGph = new PIXI.Graphics()
  gphs.push(gph)
  mirrorGphs.push(mirrorGph)
  container.addChild(gph)
  container.addChild(mirrorGph)
}

var offsets = []
for (var i = 0; i < opt.waveCount; i++) {
  offsets.push(Math.random())
}
var range = opt.wave.aFac.range
var horizon = opt.canvas.height / 2
var amp = opt.wave.amp

render()

function render() {
  for (var n = 0, len = opt.wave.layers.length; n < len; n++) {
    var tgt = opt.wave.layers[n]
    var gph = gphs[n]
    var gphMirror=mirrorGphs[n]
    gph.clear();
    gphMirror.clear();
    gph.beginFill(tgt.color, tgt.opacity)
    gphMirror.beginFill(tgt.color, tgt.opacity)
    gph.moveTo(0, horizon)
    gphMirror.moveTo(0, horizon)
    var now = Date.now()
    for (var i = 0; i < opt.canvas.width; i++) {
      var y = 0;
      for (var j = 0; j < offsets.length; j++) {
        y += calcY(i, now, offsets[j])
      }
      y += opt.wave.aveHeight
      for (var j = 0; j < 5; j++) {
        y *= amp.fold * (calcAmp(i, amp.span, amp.slideX + amp.slideRange * Math.sin(amp.slideSpeed * (j + 1) * now)) - 0.5)
      }
      y = tgt === opt.wave ? y : y * tgt.ratio
      gph.lineTo(i + 1, horizon - y)
      gphMirror.lineTo(i + 1, horizon + y)
    }
    gph.lineTo(opt.canvas.width, horizon)
    gphMirror.lineTo(opt.canvas.width, horizon)
    gph.endFill()
    gphMirror.endFill()
  }

  renderer.render(container)
  requestAnimationFrame(render)
}


function calcY(x, t, offset) {
  return aFac(t * offset) * Math.sin(offset * opt.wave.noise1 * (x + (offset - 0.5) * t * opt.wave.noise2))
}

function calcAmp(x, a, offset) {
  var y = -a * (x + offset) * (x + offset) + 1
  return y > 0 ? y : 0
}

function aFac(x) {
  var range = opt.wave.aFac.range
  var speed = opt.wave.aFac.speed
  return range * Math.sin(speed * x)
}
