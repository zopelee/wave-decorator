'use strict';

WaveSurfer.Drawer.Canvas = Object.create(WaveSurfer.Drawer);

WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas, {
  createElements: function () {
    var waveCanvas = this.wrapper.appendChild(
            this.style(document.createElement('canvas'), {
              position: 'absolute',
              zIndex: 1,
              left: 0,
              top: 0,
              bottom: 0
            })
            );
//    this.waveCc = waveCanvas.getContext('2d');

    this.progressWave = this.wrapper.appendChild(
            this.style(document.createElement('wave'), {
              position: 'absolute',
              zIndex: 2,
              left: 0,
              top: 0,
              bottom: 0,
              overflow: 'hidden',
              width: '0',
              display: 'none',
              boxSizing: 'border-box',
              borderRightStyle: 'solid',
              borderRightWidth: this.params.cursorWidth + 'px',
              borderRightColor: this.params.cursorColor,
              opacity: 0.5
            })
            );

    // set canvas1
    this.stage = new PIXI.Container();
    this.renderer = new PIXI.CanvasRenderer(this.width, this.height, {view: waveCanvas, backgroundColor: 0xAAA, transparent: true});
    this.waveCc = new PIXI.Graphics();
    this.stage.addChild(this.waveCc);
    this.shapes = []

    // set canvas2
    if (this.params.waveColor != this.params.progressColor) {
      var progressCanvas = this.progressWave.appendChild(
              document.createElement('canvas')
              );
//      this.progressCc = progressCanvas.getContext('2d');

      this.stage2 = new PIXI.Container();
      this.renderer2 = new PIXI.CanvasRenderer(this.width, this.height, {view: progressCanvas, backgroundColor: 0xAAA, transparent: true});
      this.progressCc = new PIXI.Graphics();
      this.stage2.addChild(this.progressCc);
    }
  },
  updateSize: function () {
    var width = Math.round(this.width / this.params.pixelRatio);

    this.renderer.view.width = this.width;
    this.renderer.view.height = this.height;
    this.style(this.renderer.view, {width: width + 'px'});

    this.style(this.progressWave, {display: 'block'});

    if (this.progressCc) {
      this.renderer2.view.width = this.width;
      this.renderer2.view.height = this.height;
      this.style(this.renderer2.view, {width: width + 'px'});
    }

    this.clearWave();
  },
  clearWave: function () {
    this.waveCc.clear();
    if (this.progressCc) {
      this.progressCc.clear();
    }
  },
  drawWave: function (peaks, channelIndex) {
    // Split channels
    if (peaks[0] instanceof Array) {
      var channels = peaks;
      if (this.params.splitChannels) {
        this.setHeight(channels.length * this.params.height * this.params.pixelRatio);
        channels.forEach(this.drawWave, this);
        return;
      } else {
        peaks = channels[0];
      }
    }

    // A half-pixel offset makes lines crisp
    var $ = 0.5 / this.params.pixelRatio;
    // A margin between split waveforms
    var height = this.params.height * this.params.pixelRatio;
    var offsetY = height * channelIndex || 0;
    var halfH = height / 2;
    var length = ~~(peaks.length / 2);
    var scale = 1;
    if (this.params.fillParent && this.width != length) {
      scale = this.width / length;
    }
    var absmax = 1;
    if (this.params.normalize) {
      var min, max;
      max = Math.max.apply(Math, peaks);
      min = Math.min.apply(Math, peaks);
      absmax = max;
      if (-min > absmax) {
        absmax = -min;
      }
    }

//    this.waveCc.fillStyle = this.params.waveColor;
//    if (this.progressCc) {
//      this.progressCc.fillStyle = this.params.progressColor;
//    }

    [this.waveCc, this.progressCc].forEach(function (cc) {
      if (!cc) {
        return;
      }

//        cc.lineStyle(10, 0xee82ee, 0.8);
      var fillTargets;
      if (cc === this.waveCc) {
        fillTargets = [WavesurferSetting.wave, WavesurferSetting.innerWave]
      } else {
        fillTargets = [WavesurferSetting.progress]
      }

      fillTargets.forEach(function (tgt) {
        cc.beginFill(tgt.color, tgt.opacity);
        cc.moveTo($, halfH + offsetY);

        var shpScale = 1
        var lastShp = null
        var lastShpIndex = 0

        if (peaks instanceof Array) {
          if (tgt.tag === 'wave') {
            //        var validPeaks = peaks.filter(function (pk) {
            //          return Math.abs(pk) >= 0.3
            //        })
            //        var fitHeight = halfH * validPeaks.reduce(function (a, b) {
            //          return Math.abs(a) + Math.abs(b)
            //        }) / validPeaks.length
            var maxHeight = halfH * Math.max(Math.abs(Math.max.apply(Math, peaks)), Math.abs(Math.min.apply(Math, peaks)))
            var halfShpHeights = global_textures.map(function (tex) {
              return tex.height / 2
            })
            shpScale = (maxHeight * WavesurferSetting.shapeMapping.scaleFactor) / Math.max.apply(null, halfShpHeights)
            halfShpHeights = halfShpHeights.map(function (h) {
              return h * shpScale
            })
            var maxHalfShpHeight = Math.max.apply(null, halfShpHeights)
            var minHalfShpHeight = Math.min.apply(null, halfShpHeights)

            var tmpShps = []
            for (var i = 0, len = global_textures.length; i < len; i++) {
              var shp = new PIXI.Sprite(global_textures[i])
              tmpShps.push(shp)
              shp.scale.set(shpScale, shpScale)
            }
            tmpShps[0].anchor.set(0.2, 0.5)
            tmpShps[1].anchor.set(0.5, 0.5)
            tmpShps[2].anchor.set(0.1, 0.5)
            tmpShps[3].anchor.set(0.7, 0.5)
            tmpShps[4].anchor.set(0.1, 0.5)
            tmpShps[5].anchor.set(0.9, 0.5)
            tmpShps[6].anchor.set(0.3, 0.5)
            var anchorMapping = {
              0: 0.2,
              1: 0.5,
              2: 0.1,
              3: 0.7,
              4: 0.1,
              5: 0.9,
              6: 0.3,
            };
          }

          for (var i = 0; i < length; i++) {
            try {
              //          console.log('' + peaks[2 * i].toPrecision(2) + '/' + absmax + '*' + halfH)
            } catch (err) {
            }
            var h = Math.round(peaks[2 * i] / absmax * halfH);
            h = tgt.tag === 'innerWave' ? h * tgt.ratio : h
            //        console.log(i + ' * ' + scale + ' + ' + $)
            cc.lineTo(i * scale + $, halfH - h + offsetY);
            if (tgt.tag === 'wave') {
              if (h >= minHalfShpHeight * WavesurferSetting.shapeMapping.heightFactor) {
                var shpIndex = tmpShps.indexOf(tmpShps.reduce(function (a, b) {
                  return Math.abs(a.height / 2 - h) < Math.abs(b.height / 2 - h) ? a : b
                }))
                var shp = new PIXI.Sprite(global_textures[shpIndex])
                shp.anchor.set(0.5, 0.5)
                shp.scale.set(shpScale, shpScale)
                shp.position.set(i * scale + $, halfH + offsetY)
                if ((!lastShp)
                        || (lastShp && (lastShp.width * (1 - anchorMapping[lastShpIndex]) + lastShp.position.x <= (i * scale + $) - (shp.width * anchorMapping[shpIndex])))
                        ) {
                  this.shapes.push(shp)
                  this.stage.addChild(shp)
                  lastShpIndex = shpIndex
                  lastShp = shp
                }
              }
            }
          }
        }


        // Draw the bottom edge going backwards, to make a single
        // closed hull to fill.
        for (var i = length - 1; i >= 0; i--) {
          var h = Math.round(peaks[2 * i + 1] / absmax * halfH);
          h = tgt.tag === 'innerWave' ? h * tgt.ratio : h
          cc.lineTo(i * scale + $, halfH - h + offsetY);
        }

//        cc.closePath();
//        cc.fill();
        cc.endFill()

        // Always draw a median line
        cc.drawRect(0, halfH + offsetY - $, this.width, $);
      }.bind(this))

    }, this);

    var self = this;
    self.renderer.render(self.stage)
    self.renderer2.render(self.stage2)

  },
  updateProgress: function (progress) {
    var pos = Math.round(
            this.width * progress
            ) / this.params.pixelRatio;
    this.style(this.progressWave, {width: pos + 'px'});
  }
});
