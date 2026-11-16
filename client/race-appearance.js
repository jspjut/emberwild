import * as THREE from 'three';
import {box,ball,rock,cone,beam,leaf} from './asset-library/primitives.js';
export function addRaceTraits(r,raceId,p){
  for(const side of[-1,1]){
    if(raceId==='sylvren'){
      const ear=leaf(r.head,p.leaf,side*.29,0,.02,1.2);ear.rotation.z=side*-.65;ear.rotation.y=side*.7;
      beam(r.head,p.wood,[side*.13,.15,-.05],[side*.23,.48,-.08],.025);beam(r.head,p.wood,[side*.19,.35,-.05],[side*.36,.44,.02],.018);
      for(let i=0;i<3;i++){const l=leaf(r.head,p.leaf,side*(.05+i*.065),.25+i*.045,-.06,1);l.rotation.z=side*-.6;l.rotation.x=-.5;}
    }else if(raceId==='cairnkin'){
      rock(r.head,p.dark,side*.11,.02,.23,.12,.045,.055);rock(r.head,p.stone,side*.26,-.02,0,.06,.11,.08);rock(r.head,p.trim,side*.14,.23,-.04,.08,.12,.075);rock(r.head,p.glow,side*.06,.31,-.03,.035,.11,.04,{glow:true});
      for(let i=0;i<3;i++)rock(r.head,p.dark,side*(.025+i*.06),-.19,.12,.05,.045,.07);
    }else if(raceId==='brinefolk'){
      const fin=cone(r.head,p.trim,side*.3,.03,-.02,.15,.32);fin.scale.z=.23;fin.rotation.z=side*-.95;
      for(let i=0;i<3;i++)beam(r.head,p.dark,[side*.21,-.015,-.01],[side*.39,.13-i*.05,-.01],.009);
      for(let i=0;i<3;i++)box(r.head,p.dark,side*.17,-.08-i*.032,.15,.06,.012,.015);
    }else if(raceId==='emberkin'){
      beam(r.head,p.dark,[side*.15,.14,-.05],[side*.29,.28,-.13],.065);beam(r.head,p.dark,[side*.29,.28,-.13],[side*.34,.46,-.04],.045);cone(r.head,p.trim,side*.32,.51,.005,.033,.16).rotation.z=side*.25;
      for(let i=0;i<3;i++)ball(r.head,p.glow,side*(.1+i*.032),-.08-i*.012,.22-i*.008,.012,.01,.008,{glow:true});
    }
  }
  if(raceId==='brinefolk')for(let i=0;i<4;i++){const crest=cone(r.head,p.dark,0,.25-i*.028,-.08-i*.05,.11,.23-i*.025);crest.scale.x=.22;crest.rotation.x=-.35;}
}

export function racePalette(id,palette){const base=({sylvren:'#76936a',cairnkin:'#a2a0a0',brinefolk:'#6faaa4',emberkin:'#ae8066'})[id];if(base)palette.skin='#'+new THREE.Color(palette.skin).lerp(new THREE.Color(base),.72).getHexString();}
