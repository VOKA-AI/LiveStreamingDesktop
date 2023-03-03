import { damp3, dampE } from 'maath/easing'

var _delta = 0.01;

var blandshape = {
 "eye-L":0,
 "eye-R":0,
 "eyes-_down":0,
 "mouse":0,
}

/*
 * 设置mesh的morphTarget值，进而做出表情
 * mesh指包含morphTarget的mesh，传入没有morphTartget的mesh，会出错
 * prefix指morphTargetDictionary中，blockshape名称的前缀
 */
export function setMeshMorphTargetInfluences(meshWithMorphTarget: any, blandshape:any) {
  for(var key in blandshape) {
    meshWithMorphTarget.morphTargetInfluences[meshWithMorphTarget.morphTargetDictionary[key]] = blandshape[key];
  }
}

export function modelUpdateModelPosition(model:any, position:any) {
  
    const offsetX = -320; // 变大，模型往右移动，变小模型往左移动
    var x = (position['x'] + offsetX) / 20;
    var y = -(position['y'] + 160) / 60;
    var z = (position['z'] - 40) / 5;
    damp3(model.position, [x, y, z], 0.25, _delta * 5);
}

export function modelUpdateModelRotation(model: any, rotation:any) {
  // set rotation and apply it to position
  var rx = -(rotation['x'] - 5) / 50;
  var ry = -rotation['y'] / 50;
  var rz = rotation['z'] / 50;
  dampE(model.rotation, [rx, ry, rz], 0.25, _delta * 3)
}


/*
 * 获取包含morphTarget的mesh，不通的model可能不同
 */
export function getMorphTargetMesh(model:any) {
  var mesh = model.scene.children[0].children[0];
  return mesh;
}