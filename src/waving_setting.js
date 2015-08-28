var WavingSetting = {
  canvas: {
    width: 1024,
    height: 300,
  },
  waveCount: 30,
  wave: {
    layers: [
      {
        color: 0x000000,
        opacity: 0.1,
        ratio: 1,
      },
      {
        color: 0x000000,
        opacity: 0.2,
        ratio: 0.5,
      },
      {
        color: 0x000000,
        opacity: 0.3,
        ratio: 0.3,
      },
      {
        color: 0x000000,
        opacity: 0.4,
        ratio: 0.2,
      },
      {
        color: 0x000000,
        opacity: 0.5,
        ratio: 0.1,
      },
    ],
    aFac: {
      range: 20,
      speed: 0.01,
    },
    aveHeight: 20,
    noise1: 0.8,
    noise2: 0.1,
    amp: {
      count: 5,
      fold: 2.3,
      span: 0.00005,
      slideX: -300,
      slideRange: 500,
      slideSpeed: 0.0003,
    },
  },
}