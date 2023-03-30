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
    const offsetY = 100; // 变大，模型往下移动，变小模型往上移动 160
    const offsetZ = -40; //变大，模型往后移动，变小往前移动， -40；
    var x = (position['x'] + offsetX) / 20;
    var y = -(position['y'] + offsetY) / 60;
    var z = (position['z'] + offsetZ) / 5; 
    damp3(model.position, [x, y, z], 0.25, _delta * 5);
}

export function modelUpdateModelRotation(model: any, rotation:any) {
  // set rotation and apply it to position
  var rx = -(rotation['x'] - 5) / 50; // 绕x轴旋转
  var ry = -rotation['y'] / 50; // 绕y轴旋转, 0时正对前方
  var rz = rotation['z'] / 50; // 绕z轴旋转

  // 限制范围
  //ry = ry > 0.3 ? 0.3 : ry;
  //ry = ry < -0.3 ? -0.3 : ry;
  dampE(model.rotation, [rx, ry, rz], 0.25, _delta * 3)
}


/*
 * 获取包含morphTarget的mesh，不通的model可能不同
 */
export function getMorphTargetMesh(model:any) {
  var mesh = model.scene.children[0].children[0];
  return mesh;
}