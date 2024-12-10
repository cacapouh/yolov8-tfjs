import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import { detect } from "./utils/detect";
import "./style/App.css";
import { createSfen } from "./utils/sfen";
import { ShogiEngine } from "./utils/ShogiEngine";
import { expectedMovesToHumanReadable } from "./utils/shogi";

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
    sfen: "",
    messageFromEngine: "",
    expectedMoves: "",
  }); // init model & input shape

  // references
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // model configs
  const modelName = "yolov11x";

  const engine = new ShogiEngine();
  const research = async (sfen) => {
    await engine.research(`position sfen ${sfen}`, 1000, 1, (r) => {
      let expectedMoves = "";
      if (r.includes("checkmate") && !r.includes("nomate")) {
        const moves = r.split(" ").slice(2);
        expectedMoves = expectedMovesToHumanReadable(sfen, moves);
      }

      setModel({
        net: model.net,
        inputShape: model.inputShape,
        sfen: sfen,
        messageFromEngine: r,
        expectedMoves: expectedMoves,
      });
    });
  };

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);

  return (
    <div className="App">
      {loading.loading && (
        <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>
      )}
      <div className="header">
        <h1>🏳 😇 詰将棋敗北者Web 😇 🏳</h1>
        <p>
          YOLOv11 detection application on browser powered by{" "}
          <code>tensorflow.js</code>
        </p>
      </div>

      <div className="content">
        <img
          src="#"
          ref={imageRef}
          onLoad={async () =>
            detect(
              imageRef.current,
              model,
              canvasRef.current,
              async (results) => {
                const sfen = createSfen(results);
                await research(sfen);
              }
            )
          }
        />
        <canvas
          width={model.inputShape[1]}
          height={model.inputShape[2]}
          ref={canvasRef}
        />
      </div>

      <ButtonHandler
        imageRef={imageRef}
        cameraRef={cameraRef}
        videoRef={videoRef}
      />

      <br />

      <div>
        <label>読み筋:</label>
        <br />
        <textarea
          readOnly
          className="message-area"
          value={model.expectedMoves}
        ></textarea>
      </div>

      <div>
        <label>SFEN(将棋の局面を表す文字列):</label>
        <br />
        <textarea
          readOnly
          className="debug-message-area"
          value={model.sfen}
        ></textarea>
        <br />

        <label>将棋エンジンからの応答:</label>
        <br />
        <textarea
          readOnly
          className="debug-message-area"
          value={model.messageFromEngine}
        ></textarea>
        <br />
      </div>
    </div>
  );
};

export default App;
