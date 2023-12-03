import { useState } from "react";
import ReactLoading from "react-loading";
import * as Cesium from "cesium";
import { Cartographic } from "cesium";
import { viewer, upload, capture } from "./viewer.js";

const App = () => {
  const [loading, setLoading] = useState(false);

  const analyze = () => {
    const camera = viewer.camera;
    const c = Cartographic.fromCartesian(camera.positionWC);
    const params = {
      lon: Cesium.Math.toDegrees(c.longitude),
      lat: Cesium.Math.toDegrees(c.latitude),
      height: c.height,
      heading: Cesium.Math.toDegrees(camera.heading),
      pitch: Cesium.Math.toDegrees(camera.pitch),
    };
    console.log(params);
    setLoading(true);
    upload(capture(), params, () => {
      setLoading(false);
    });
  };

  return (
    <>
      {loading && <ReactLoading type="spokes" color="black" id="center-loading" />}
      <div id="top-right-bar">
        <button onClick={analyze}>Analyze</button>
      </div>
    </>
  );
};

export default App;
