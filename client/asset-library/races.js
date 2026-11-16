import {creatureCycle} from './motion.js';
import {createHumanoid} from '../character.js';
import {equipmentRecipe,equipmentModel} from '../equipment.js';
import {itemRecipe,expansionAsset} from '../../shared/asset-library.js';
import {gearSetItems} from '../../shared/equipment-collection.js';
import {group,box,ball,rock,cone,beam,leaf} from './primitives.js';
export function raceAsset(def,p,region,outfitOptions={}){
  const human=def.model==='human',root=group(null,def.id),humanoid=human?createHumanoid(p.cloth,false,'hearth'):createHumanoid(p.cloth,false,'hearth',{hairStyle:'bald',facialHair:'none',build:def.model==='cairnkin'?'broad':def.model==='sylvren'?'slender':'balanced'},{skin:def.model==='sylvren'?p.leaf:def.model==='cairnkin'?p.stone:p.body,hair:p.dark,cloth:p.cloth,eyes:p.glow});root.add(humanoid);
  const r=humanoid.userData.rig,joints=[r.body,r.torso,r.head,...r.legs.flatMap(l=>[l.hip,l.knee,l.ankle]),...r.arms.flatMap(a=>[a.shoulder,a.elbow])];
  r.body.scale.y=def.model==='cairnkin'?.86:def.model==='sylvren'?1.07:1;
  for(const side of[-1,1]){
    if(def.model==='sylvren'){
      const ear=leaf(r.head,p.leaf,side*.29,0,.02,1.2);ear.rotation.z=side*-.65;ear.rotation.y=side*.7;
      beam(r.head,p.wood,[side*.13,.15,-.05],[side*.23,.48,-.08],.025);beam(r.head,p.wood,[side*.19,.35,-.05],[side*.36,.44,.02],.018);
      for(let i=0;i<3;i++){const l=leaf(r.head,p.leaf,side*(.05+i*.065),.25+i*.045,-.06,1);l.rotation.z=side*-.6;l.rotation.x=-.5;}
    }else if(def.model==='cairnkin'){
      rock(r.head,p.dark,side*.11,.02,.23,.12,.045,.055);rock(r.head,p.stone,side*.26,-.02,0,.06,.11,.08);rock(r.head,p.trim,side*.14,.23,-.04,.08,.12,.075);rock(r.head,p.glow,side*.06,.31,-.03,.035,.11,.04,{glow:true});
      for(let i=0;i<3;i++)rock(r.head,p.dark,side*(.025+i*.06),-.19,.12,.05,.045,.07);
    }else if(def.model==='brinefolk'){
      const fin=cone(r.head,p.trim,side*.3,.03,-.02,.15,.32);fin.scale.z=.23;fin.rotation.z=side*-.95;
      for(let i=0;i<3;i++)beam(r.head,p.dark,[side*.21,-.015,-.01],[side*.39,.13-i*.05,-.01],.009);
      for(let i=0;i<3;i++)box(r.head,p.dark,side*.17,-.08-i*.032,.15,.06,.012,.015);
    }else if(def.model==='emberkin'){
      beam(r.head,p.dark,[side*.15,.14,-.05],[side*.29,.28,-.13],.065);beam(r.head,p.dark,[side*.29,.28,-.13],[side*.34,.46,-.04],.045);cone(r.head,p.trim,side*.32,.51,.005,.033,.16).rotation.z=side*.25;
      for(let i=0;i<3;i++)ball(r.head,p.glow,side*(.1+i*.032),-.08-i*.012,.22-i*.008,.012,.01,.008,{glow:true});
    }
  }
  if(def.model==='brinefolk')for(let i=0;i<4;i++){const crest=cone(r.head,p.dark,0,.25-i*.028,-.08-i*.05,.11,.23-i*.025);crest.scale.x=.22;crest.rotation.x=-.35;}
  const outfit=[];
  function dress(enabled=true,options=outfitOptions){for(const part of outfit)part.removeFromParent();outfit.length=0;r.baseTorso.visible=true;r.hair.visible=true;for(const m of[...r.baseFeet,...r.baseLegs])m.visible=true;
    if(!enabled)return;
    const ids=options.setId?[...gearSetItems(options.setId),...options.itemId?[options.itemId]:[]]:options.itemId?[options.itemId]:human?['linen_coat','training_blade']:['warden_coat','trail_leggings','wayfarer_boots_asset'];
    for(const id of ids){const item=expansionAsset(id),slot=item?.slot||({linen_coat:'armor',training_blade:'weapon'})[id];if(slot==='head'&&options.hideHead)continue;
      const pieces=item?equipmentRecipe(itemRecipe(item,region)):equipmentModel(id);
      for(const[socket,part]of Object.entries(pieces)){part.userData.socket=socket;part.userData.itemId=id;r.sockets[socket].add(part);outfit.push(part);}
      if(slot==='armor')r.baseTorso.visible=false;if(slot==='head')r.hair.visible=false;if(slot==='legs')for(const m of r.baseLegs)m.visible=false;if(slot==='feet')for(const m of r.baseFeet)m.visible=false;
    }
  }
  dress(outfitOptions.enabled!==false);
  return {root,joints,rig:r,dress,animate(time,state){const {move,phase,attack}=creatureCycle(time,state);r.body.position.y+=Math.sin(phase)*.007+Math.abs(Math.sin(phase*2))*.02*move;r.torso.rotation.x-=move*.08+attack*.12;r.head.rotation.y+=Math.sin(phase)*.05*(1-move);r.legs.forEach((leg,i)=>{const wave=Math.sin(phase+i*Math.PI);leg.hip.rotation.x+=wave*.55*move;leg.knee.rotation.x+=Math.max(0,-wave)*.75*move;leg.ankle.rotation.x-=Math.max(0,-wave)*.3*move;});r.arms.forEach((arm,i)=>{arm.shoulder.rotation.x+=Math.sin(phase+(1-i)*Math.PI)*.4*move-attack*(i?1.3:.4);arm.elbow.rotation.x-=attack*.65;});}};
}
