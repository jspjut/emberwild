import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {expansionClips} from './library.js';
export async function exportExpansionGLB(root){
  const clips=expansionClips(root),saved=[];
  // Existing game rigs keep live Object3D references in userData. Export only
  // the serializable art metadata and socket labels, then restore the rig.
  root.traverse(node=>{saved.push([node,node.userData]);node.userData=node===root?{library:root.userData.library}:node.userData.socket?{socket:node.userData.socket}:{};});
  try{return await new GLTFExporter().parseAsync(root,{binary:true,animations:clips,onlyVisible:true});}
  finally{for(const[node,data]of saved)node.userData=data;}
}
