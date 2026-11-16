import test from 'node:test';import assert from 'node:assert/strict';
import {Preferences,BINDING_ACTIONS,DEFAULT_SETTINGS,defaultBindings,sanitizeBindings,sanitizeSettings,validBinding,eventBinding,bindingLabel} from '../client/settings.js';
const store=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
const event=(code,mods={})=>({code,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false,...mods});
test('defaults preserve movement aliases, Space jump, window keys, action slots and Shift quick-loot',()=>{
 const p=new Preferences();assert.equal(p.actionForEvent(event('Space')),'jump');assert.equal(p.actionForEvent(event('KeyI')),'bags');assert.equal(p.actionForEvent(event('KeyJ')),'journal');assert.equal(p.actionForEvent(event('Equal')),'action12');assert.equal(p.actionForEvent(event('KeyF',{shiftKey:true})),'interact');assert.equal(p.held('forward',new Set(['ArrowUp'])),true);assert.equal(p.held('forward',new Set(['KeyW','ShiftLeft'])),true);assert.equal(p.actionForEvent(event('Escape')),null);
});
test('rebinding resolves conflicts, updates labels, supports modifiers, clearing and browser persistence',()=>{
 const storage=store(),p=new Preferences(storage);assert.deepEqual(p.bind('action1',0,'KeyB'),['Bags']);assert.equal(p.actionForEvent(event('KeyB')),'action1');assert.equal(p.actionForEvent(event('KeyI')),'bags');assert.equal(p.label('action1'),'B');
 p.bind('action2',0,'Control+Shift+KeyK');assert.equal(p.actionForEvent(event('KeyK',{ctrlKey:true,shiftKey:true})),'action2');assert.equal(p.actionForEvent(event('KeyK')),null);assert.equal(p.label('action2',true),'C-S-K');
 p.bind('action2',0,null);assert.equal(p.label('action2'),'Unbound');p.set('cameraSensitivity',1.6);p.set('quality','low');const reload=new Preferences(storage);assert.deepEqual(reload.bindings,p.bindings);assert.equal(reload.settings.cameraSensitivity,1.6);assert.equal(reload.settings.quality,'low');reload.resetBindings();assert.deepEqual(reload.bindings,defaultBindings());
});
test('movement chords require their modifier while unmodified movement tolerates quick-loot modifiers',()=>{
 const p=new Preferences();p.bind('forward',0,'Shift+KeyR');assert.equal(p.held('forward',new Set(['KeyR'])),false);assert.equal(p.held('forward',new Set(['ShiftRight','KeyR'])),true);p.bind('interact',0,'Control+KeyE');assert.equal(p.actionForEvent(event('KeyE',{ctrlKey:true,shiftKey:true})),'interact');p.bind('action3',0,'Control+Shift+KeyE');assert.equal(p.actionForEvent(event('KeyE',{ctrlKey:true,shiftKey:true})),'action3');
});
test('invalid storage, duplicate assignments and reserved shortcuts cannot create broken bindings',()=>{
 for(const key of ['Escape','Control+KeyW','Control+Shift+KeyI','Alt+F4','Alt+Tab','F5','F12','Meta+KeyK','Shift+Control+KeyK','Control+Control+KeyK','whatever'])assert.equal(validBinding(key),false,key);
 assert.equal(eventBinding(event('ShiftLeft',{shiftKey:true})),null);assert.equal(eventBinding(event('KeyK',{metaKey:true})),null);assert.equal(bindingLabel('Shift+Space'),'Shift + Space');assert.equal(bindingLabel('ArrowUp',true),'↑');
 const bad=defaultBindings();bad.forward=['KeyW','KeyW'];bad.action1=['KeyW',null];bad.jump=['Escape',null];const clean=sanitizeBindings(bad),all=Object.values(clean).flat().filter(Boolean);assert.equal(new Set(all).size,all.length);assert.equal(clean.jump[0],'Space');assert.deepEqual(new Preferences({getItem:()=>'{broken'}).settings,DEFAULT_SETTINGS);
});
test('settings sanitize types and ranges and still work when storage is unavailable',()=>{
 assert.deepEqual(sanitizeSettings({volume:NaN,cameraSensitivity:-1,quality:'ultra',sound:'yes',showPerformance:false,ambientMotion:false}),{...DEFAULT_SETTINGS,cameraSensitivity:.25,showPerformance:false,ambientMotion:false});
 const p=new Preferences({getItem:()=>{throw Error('disabled');},setItem:()=>{throw Error('disabled');}});p.set('volume',2);assert.equal(p.settings.volume,1);p.bind('jump',0,'KeyR');assert.equal(p.label('jump'),'R');assert.equal(p.bind('missing',0,'KeyX'),null);assert.equal(p.bind('jump',4,'KeyX'),null);assert.equal(BINDING_ACTIONS.length,29);
});


test('autorun and turning defaults support mouse alternatives, modifiers and durable rebinding',()=>{
 const storage=store(),p=new Preferences(storage);assert.equal(p.actionForEvent(event('KeyR')),'autorun');assert.equal(p.actionForEvent(event('KeyQ')),'turnLeft');assert.equal(p.actionForEvent(event('KeyE')),'turnRight');assert.equal(p.actionForEvent({button:3}),'autorun');assert.equal(bindingLabel('Mouse3'),'Mouse Back');assert.equal(bindingLabel('Mouse4'),'Mouse Forward');
 p.bind('autorun',1,'Shift+Mouse4');assert.equal(p.actionForEvent({button:4,shiftKey:true}),'autorun');assert.equal(p.actionForEvent({button:3}),null);assert.equal(p.actionForEvent(event('KeyR')),'autorun');assert.deepEqual(new Preferences(storage).bindings.autorun,['KeyR','Shift+Mouse4']);
 for(const binding of ['Mouse0','Mouse2','Mouse5'])assert.equal(validBinding(binding),false);assert.equal(p.held('autorun',new Set(['Mouse4','ShiftLeft'])),true);
});
test('new control defaults never steal existing customized R, Q or E bindings',()=>{
 const saved=defaultBindings();delete saved.autorun;delete saved.turnLeft;delete saved.turnRight;saved.action1=['KeyR',null];saved.character=['KeyQ','KeyE'];const clean=sanitizeBindings(saved);assert.deepEqual(clean.action1,['KeyR',null]);assert.deepEqual(clean.character,['KeyQ','KeyE']);assert.deepEqual(clean.autorun,[null,'Mouse3']);assert.deepEqual(clean.turnLeft,[null,null]);assert.deepEqual(clean.turnRight,[null,null]);
});
