// Geographic anchors, deliberately asymmetric. Routes follow their safe banks.
export const REACH_WATERS=[
 {id:'saltglass',name:'Saltglass Mere',x:315,z:45,radiusX:18,radiusZ:32},
 {id:'reed-pool',name:'Reedwater Pools',x:259,z:258,radiusX:16,radiusZ:14},
 {id:'fen-pool',name:'The Lowwater',x:165,z:342,radiusX:18,radiusZ:11}
];
export const reachWaterRadius=(x,z,w)=>Math.hypot((x-w.x)/w.radiusX,(z-w.z)/w.radiusZ);
