import * as Cesium from "cesium";
import { Cartesian3, Cartographic, JulianDate } from "cesium";

const GEOID = 36.7071;

Cesium.RequestScheduler.requestsByServer["tile.googleapis.com:443"] = 18;

const createViewer = (cameraParam) => {
  const viewer = new Cesium.Viewer("map", {
    imageryProvider: false,
    baseLayerPicker: false,
    geocoder: false,
    // globe: false,

    animation: false,
    fullscreenButton: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    // navigationInstructionsInitiallyVisible: false,
    scene3DOnly: true,
    clockViewModel: null,
    // vrButton: true,
    // shadows: true,
    // terrainShadows: Cesium.ShadowMode.ENABLED,

    requestRenderMode: true,
    maximumRenderTimeChange: 0.067,
    contextOptions: {
      webgl: {
        preserveDrawingBuffer: true,
      },
    },
  });

  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.maximumScreenSpaceError = 1; // if more refine terrain
  viewer.shadowMap.maximumDistance = 1000.0;
  // viewer.shadowMap.softShadows = true;
  viewer.shadowMap.size = 4096;
  viewer.clock.multiplier = 1;
  viewer.clock.shouldAnimate = true;
  viewer.clock.currentTime.secondsOfDay = (10 + 3) * 3600;
  // viewer.scene.fog.density = 0.001;
  // viewer.scene.fog.screenSpaceErrorFactor = 4;
  // viewer.scene.debugShowFramesPerSecond = true;
  // viewer.extend(Cesium.viewerCesiumInspectorMixin);
  // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
  // viewer.scene.debugShowFramesPerSecond = true;

  viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: "https://tile.googleapis.com/v1/3dtiles/root.json?key=AIzaSyAhhezPHi_y0HsNezwD-eGfLR0mu7UkQQA",
      showCreditsOnScreen: true,
    })
  );

  viewer.camera.percentageChanged = 0.001;
  const center = Cartesian3.fromDegrees(cameraParam.lon, cameraParam.lat, 30 + GEOID + 2.5);
  const heading = Cesium.Math.toRadians(cameraParam.heading);
  const pitch = Cesium.Math.toRadians(cameraParam.pitch);
  const range = cameraParam.range;
  viewer.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));

  return viewer;
};

const capture = (function () {
  const captured = document.createElement("canvas");
  captured.style.display = "none";
  document.body.appendChild(captured);
  return () => {
    const src = document.body.querySelector(".cesium-widget").getElementsByTagName("canvas")[0];
    captured.width = src.width;
    captured.height = src.height;
    const context = captured.getContext("2d");
    context.drawImage(src, 0, 0);
    return captured;
  };
})();

// const download = (canvas, filename) => {
//   canvas.toBlob((blob) => {
//     const a = document.createElement("a");
//     a.href = window.URL.createObjectURL(blob);
//     a.download = filename;
//     a.click();
//   });
// };

const upload = (canvas, params, cb) => {
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append("file", blob);
    for (const [k, v] of Object.entries(params)) {
      formData.append(k, v);
    }
    fetch("http://127.0.0.1:5000/analyze", { method: "POST", body: formData })
      .then((response) => response.text())
      .then((responseText) => {
        const js = JSON.parse(responseText);
        console.log(js);
        showDialog(js.name, js.histogram);
        cb();
      });
  });
};

const showDialog = (name, histogram) => {
  const dialog = document.body.querySelector("dialog");
  dialog.querySelector("img").src = `http://127.0.0.1:5000/analyzed/graph/${name}.png`;
  dialog.querySelector("p").innerHTML = histogram;
  dialog.showModal();
};

document.addEventListener(
  "keydown",
  (e) => {
    const camera = viewer.camera;
    // const height = ellipsoid.cartesianToCartographic(camera.position).height;
    const height = Cartographic.fromCartesian(camera.positionWC).height;
    const moveRate = height / 100.0;
    if (e.key === "w") {
      camera.moveForward(moveRate);
    }
    if (e.key === "s") {
      camera.moveBackward(moveRate);
    }
    if (e.key === "q") {
      camera.moveUp(moveRate);
    }
    if (e.key === "e") {
      camera.moveDown(moveRate);
    }
    if (e.key === "a") {
      camera.moveLeft(moveRate);
    }
    if (e.key === "d") {
      camera.moveRight(moveRate);
    }
  },
  false
);

// --

// const cameraParam = {
//   lon: 139.1039766,
//   lat: 35.233296,
//   heading: 0,
//   pitch: -80,
//   range: 1000,
// };

const cameraParam = {
  lon: 139.7004,
  lat: 35.6895,
  heading: 0,
  pitch: -80,
  range: 1000,
};
const url = new URL(window.location.href);
Object.keys(cameraParam).map((key) => {
  if (url.searchParams.get(key)) {
    cameraParam[key] = +url.searchParams.get(key);
  }
});

const viewer = createViewer(cameraParam);

window.viewer = viewer;
window.Cesium = Cesium;

export { viewer, capture, upload };
