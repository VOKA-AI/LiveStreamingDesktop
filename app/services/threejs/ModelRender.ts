import { damp3, dampE } from 'maath/easing'
import * as remote from '@electron/remote';

var _delta = 0.01;

var blandshape = {
 "eye-L":0,
 "eye-R":0,
 "eyes-_down":0,
 "mouse":0,
}

/*
var blandshape = { // 头套NFT
 "Mouth_Open":0,
}
*/

export default class ModelRender {
  positionOriginX: number = -320;
  positionOriginY: number = 100;
  positionOriginZ: number = -40;
  positionScaleX: number = 20;
  positionScaleY: number = 60;
  positionScaleZ: number = 5;

  rotationOriginX: number = -5;
  rotationOriginY: number = 0;
  rotationOriginZ: number = 0;
  rotationScaleX: number = 50;
  rotationScaleY: number = 50;
  rotationScaleZ: number = 50;

  mousePressed: boolean = false;
  constructor() {
    document.addEventListener('mouseenter', e=> {
      console.log("enter");
    })
    document.addEventListener('mouseleave', e=> {
      console.log("leave");
      //remote.getCurrentWindow().minimize();
    })
    document.addEventListener('mousedown', e => {
      this.mousePressed = true;
    })
    document.addEventListener('mouseup', e => {
      this.mousePressed = false;
    })
    document.addEventListener("mousemove", e => {
      if(!this.mousePressed) {
        return;
      }
      // get the movementX and movementY properties
      var x = e.movementX;
      var y = e.movementY;
      this.positionOriginY += y * 0.02 * Math.abs(this.positionOriginZ);
      this.positionOriginX += x * 0.01 * Math.abs(this.positionOriginZ);
    });
    document.addEventListener('keydown', e => {
        console.log("Camera ", e.type);
        console.log("Camera ", e.key);
        switch(e.key) {
         case "ArrowUp": {
           this.positionOriginY -= 0.1 * this.positionScaleY;
           break;
         }
         case "ArrowDown": {
           this.positionOriginY += 0.1 * this.positionScaleY;
           break;
         }
         case "ArrowLeft": {
           this.positionOriginX -= 0.1 * this.positionScaleX;
           break;
         }
         case "ArrowRight": {
           this.positionOriginX += 0.1 * this.positionScaleX;
           break;
         }
         case "add": {
           this.positionOriginZ += 0.01 * this.positionScaleZ;
           break;
         }
         case "subtract": {
           this.positionOriginZ -= 0.01 * this.positionScaleZ;
           break;
         }
        }
    })
    document.addEventListener("wheel", e => {
      this.positionOriginZ += 0.01 * this.positionScaleZ * e.deltaY;
    })
  }

  /*
   * 设置mesh的morphTarget值，进而做出表情
   * mesh指包含morphTarget的mesh，传入没有morphTartget的mesh，会出错
   * prefix指morphTargetDictionary中，blockshape名称的前缀
   */
  setMeshMorphTargetInfluences(meshWithMorphTarget: any, blandshape: any) {
    for (var key in blandshape) {
      meshWithMorphTarget.morphTargetInfluences[meshWithMorphTarget.morphTargetDictionary[key]] = blandshape[key];
    }
  }

  modelUpdate(model: any, riggedFace:any) {
    var x = ( riggedFace.head.position.x + this.positionOriginX) / this.positionScaleX;
    var y = -( riggedFace.head.position.y + this.positionOriginY) / this.positionScaleY;
    var z = ( riggedFace.head.position.z + this.positionOriginZ) / this.positionScaleZ;
    var rx = -(riggedFace.head.degrees.x + this.rotationOriginX) / this.rotationScaleX; // 绕x轴旋转
    var ry = -(riggedFace.head.degrees.y + this.rotationOriginY) / this.rotationScaleY; // 绕y轴旋转, 0时正对前方
    var rz = (riggedFace.head.degrees.z + this.rotationOriginZ) / this.rotationScaleZ; // 绕z轴旋转
    if(ry > 0.7 || ry < -0.7) {
      return;
    }

    this.modelUpdateModelPosition(model, { 'x': x, 'y': y, 'z': z });
    this.modelUpdateModelRotation(model, { 'x': rx, 'y': ry, 'z': rz });
  }

  modelUpdateModelPosition(model: any, position: any) {
    damp3(model.position, [position['x'], position['y'], position['z']], 0.25, _delta * 5);
  }

  modelUpdateModelRotation(model: any, rotation: any) {

    // 限制范围
    //ry = ry > 0.3 ? 0.3 : ry;
    //ry = ry < -0.3 ? -0.3 : ry;
    dampE(model.rotation, [rotation['x'], rotation['y'], rotation['z']], 0.25, _delta * 3)
  }


  /*
   * 获取包含morphTarget的mesh，不通的model可能不同
   */
  getMorphTargetMesh(model: any) {
    var mesh = model.scene.children[0].children[0];
    // console.log(model.scene.children[1].children[0]); // 头套NFT
    //var mesh = model.scene.children[1].children[0];
    return mesh;
  }
}