import {readFile} from 'node:fs/promises';
const config=JSON.parse(await readFile(new URL('../.github/engine.json',import.meta.url),'utf8'));
if(!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(config.repository)||!/^[a-f0-9]{40}$/.test(config.ref))throw Error('Set .github/engine.json to the KithCore engine owner/repository (jspjut/kithcore for upstream) and a tested full 40-character commit SHA before enabling CI.');
console.log(`repository=${config.repository}\nref=${config.ref}`);
