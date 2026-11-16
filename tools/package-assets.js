import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
const directory=fileURLToPath(new URL('../client/assets/',import.meta.url));
await promisify(execFile)('tar',['-czf','collection.tar.gz','models','previews','icons','library-manifest.json','catalog.html','LICENSE','README.md','ITEMIZATION_AND_LEVELING.md'],{cwd:directory});
console.log('Packaged client/assets/collection.tar.gz');
