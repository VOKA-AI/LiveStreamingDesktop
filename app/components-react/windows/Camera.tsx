import React, {useEffect, useRef} from "react";
import styles from './Camera.m.less';
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from '@mediapipe/camera_utils';
import { Face } from "kalidokit";
import Webcam from "react-webcam";


const mediapipeConfigOptions = {
  selfieMode: false,
  enableFaceGeometry: false,
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
};

export default function CameraWindows() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    var camera: any;
    var videoElement: HTMLVideoElement;

    function onResults(results: any) {
        console.log("--------- on results start -----------")
        if(results.multiFaceLandmarks.length < 1) {
            return;
        }

        const riggedFace = Face.solve(results.multiFaceLandmarks[0], {
            runtime: 'mediapipe',
            video: videoElement,
            imageSize: {
                width: parseInt(videoElement.style.width),
                height: parseInt(videoElement.style.height),
            },
        });
        console.log(riggedFace)
        console.log("--------- on results end -----------")
    }

    useEffect(() => {
        const faceMesh = new FaceMesh({
              locateFile: (file) => {
                  return `media/mediapipe/${file}`;
          },
        });

        faceMesh.setOptions(mediapipeConfigOptions)
        faceMesh.onResults(onResults);

        if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
            const current: any = webcamRef.current
            videoElement = current.video;
            camera = new Camera(videoElement, {
                onFrame: async () => {
                    await faceMesh.send({ image: videoElement });
                },
                width: 640,
                height: 480,
            });
            camera.start();
        }
    }, [])

    return (
        <div>
            <Webcam className={styles.Camera} ref={webcamRef}/>{" "}
            <canvas className={styles.Canvas} ref={canvasRef}></canvas>
        </div>
    )
}