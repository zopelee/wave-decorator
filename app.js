var opt = WavingSetting

var container = new PIXI.Container()
var renderer = new PIXI.CanvasRenderer(opt.canvas.width, opt.canvas.height, {view: document.getElementById('waving_canvas'), transparent: true})
var gph = new PIXI.Graphics()
container.addChild(gph)

var offsets = []
for (var i = 0; i < 20; i++) {
  offsets.push(Math.random())
}

render()

function render() {
  gph.clear();
  [opt.wave, opt.innerWave].forEach(function (tgt) {
    gph.beginFill(tgt.color, tgt.opacity)
    gph.moveTo(0, opt.canvas.height / 2)
    var now = Date.now()
    for (var i = 0; i < opt.canvas.width; i++) {
      var y = 0;
      for (var j = 0; j < offsets.length; j++) {
        y += calcY(i, now, offsets[j])
      }
      y = tgt === opt.wave ? y : y * tgt.ratio
      gph.lineTo(i + 1, 150 - y)
    }
    gph.lineTo(opt.canvas.width, opt.canvas.height / 2)
    gph.endFill()
  });

  renderer.render(container)
  requestAnimationFrame(render)
}



function calcY(x, t, offset) {
  return aFac(t * offset) * Math.sin(offset * opt.wave.noise1 * (x + (offset - 0.5) * t * opt.wave.noise2))
}

function aFac(x) {
  var range = opt.wave.aFac.range
  var speed = opt.wave.aFac.speed
  return range * Math.sin(speed * x)
}
