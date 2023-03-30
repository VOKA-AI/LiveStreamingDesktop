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
    AmbientLight,
    sRGBEncoding,
 } from "three";
 import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
 import { getMorphTargetMesh, setMeshMorphTargetInfluences, modelUpdateModelPosition, modelUpdateModelRotation } from 'services/threejs/ModelRender'


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
    var meshWithMorphTarget: any;
    var mixer: any;
    var riggedFace:any;

    function onResults(results: any) {
        if(results.multiFaceLandmarks.length < 1) {
            return;
        }

        riggedFace = Face.solve(results.multiFaceLandmarks[0], {
            runtime: 'mediapipe',
            video: videoElement,
            imageSize: {
                width: parseInt(videoElement.style.width),
                height: parseInt(videoElement.style.height),
            },
        });
    }

    function createThree() {
        const scene = new Scene();
        //scene.background = new Color( 0xf0f0f0 );
        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        const parentElement:any = threeRef.current
        parentElement.appendChild(renderer.domElement)
        camera.position.z = 20;

        const light1 = new DirectionalLight(0xffffff);
        light1.position.set(0, 0, 25).normalize();
        scene.add(light1);

        const light2 = new AmbientLight(0xffffff, 0.1);
        //light1.position.set(0, 25, 25).normalize();
        //light2.position.set(- 1, - 1, - 1).normalize();
        scene.add(light2);

        const loader = new GLTFLoader();
        // TODO: 打包后，model好像会坏掉，删除重新接入model，会
        //loader.load('media/models/Duck3.glb', function (gltf: any) {
        loader.load('https://github.com/VOKA-AI/react-face-mask/blob/main/public/Duck2.glb?raw=true', function (gltf: any) {
            meshWithMorphTarget = getMorphTargetMesh(gltf)
            mesh = gltf.scene
            mesh.scale.set(13, 13, 13);
            scene.add(mesh)
            //scene.add(gltf.scene);
            //mixer = new AnimationMixer(mesh);
            //mixer.clipAction(gltf.animations[0]).setDuration(1).play();
            animate()
        }, undefined, function (error) {
            console.error(error);
        });

        function animate() {
            requestAnimationFrame(animate);

            if(riggedFace && mesh && mesh.children && mesh.children.length > 0) {
            //console.log(meshWithMorphTarget.morphTargetInfluences)
            //setMeshMorphTargetInfluences(meshWithMorphTarget, {'mouse':((meshWithMorphTarget.morphTargetInfluences[meshWithMorphTarget.morphTargetDictionary["mouse"]] * 10 + 1) % 10)/10})
            setMeshMorphTargetInfluences(meshWithMorphTarget, {'eye-R':1 - riggedFace.eye.r,'eye-L':1 - riggedFace.eye.l, 'eyes-_down': 0, 'mouse':riggedFace.mouth.shape.A});

            modelUpdateModelPosition(mesh, { 'x': riggedFace.head.position.x, 'y': riggedFace.head.position.y, 'z': riggedFace.head.position.z });

            modelUpdateModelRotation(mesh, { 'x': riggedFace.head.degrees.x, 'y': riggedFace.head.degrees.y, 'z': riggedFace.head.degrees.z });
            }
            renderer.render(scene, camera);
        }
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
        createThree()
        const faceMesh = new FaceMesh({
              locateFile: (file) => {
                // TODO: 不优雅的方式，问题应该处在webpack上，后期采用更优雅方式解决文件定位不到的问题
                if(file.split('.')[1] === 'data') {
                    return `resources/app/media/mediapipe/${file}`;
                }
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

    // TODO:需要解决resize的问题，现在resize会出现threejs不跟着变化的问题
    return (
        <div>
            <div className={styles.Three} ref={threeRef}></div>
            <Webcam className={styles.Camera} ref={webcamRef}/>{" "}
            <canvas className={styles.Canvas} ref={canvasRef}></canvas>
        </div>
    )
}