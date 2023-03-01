import React, {useEffect, useRef} from "react";
import styles from './Camera.m.less';
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from '@mediapipe/camera_utils';
import { Face } from "kalidokit";
import Webcam from "react-webcam";
import { 
    Scene, 
    PerspectiveCamera, 
    BoxGeometry, 
    Mesh, 
    WebGLRenderer, 
    MeshBasicMaterial, 
    Color,
    PointLight,
    DirectionalLight,
    AnimationMixer,
    sRGBEncoding,
 } from "three";
 import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


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
    const threeRef = useRef(null);
    var camera: any;
    var videoElement: HTMLVideoElement;
    var mesh: any;
    var mixer: any;

    function onResults(results: any) {
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
    }

    function createThree() {
        const scene = new Scene();
        //scene.background = new Color( 0xf0f0f0 );
        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        const parentElement:any = threeRef.current
        parentElement.appendChild(renderer.domElement)
        camera.position.y = -10;

        const light1 = new DirectionalLight( 0xefefff, 1.5 );
        light1.position.set(1, 1, 1).normalize();
        scene.add(light1);

        const light2 = new DirectionalLight(0xffefef, 1.5);
        light2.position.set(- 1, - 1, - 1).normalize();
        scene.add(light2);

        const loader = new GLTFLoader();
        loader.load('media/models/Horse.glb', function (gltf: any) {
            mesh = gltf.scene.children[0];
            mesh.scale.set(0.5, 0.5, 0.5);
            scene.add(mesh);
            mixer = new AnimationMixer(mesh);
            mixer.clipAction(gltf.animations[0]).setDuration(1).play();
        }, undefined, function (error) {
            console.error(error);
        });

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate()
    }
    
    function createThree2() {
        const scene = new Scene();
        //scene.background = new Color( 0xf0f0f0 );
        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        const parentElement:any = threeRef.current
        if(parentElement) {
            parentElement.appendChild(renderer.domElement)
        }

        const geometry = new BoxGeometry( 1, 1, 1 );
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new Mesh(geometry, material);
        scene.add(cube);
        camera.position.z = 5;

        function animate() {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.1;
            cube.rotation.y += 0.1;
            renderer.render(scene, camera);
        }
        animate()
    }

    useEffect(() => {
        createThree2()
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
            <div className={styles.Three} ref={threeRef}></div>
            <Webcam className={styles.Camera} ref={webcamRef}/>{" "}
            <canvas className={styles.Canvas} ref={canvasRef}></canvas>
        </div>
    )
}