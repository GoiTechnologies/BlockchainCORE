import PKG from './package.json';
import Block from './blockchain/block';
const { name,version } = PKG;
console.log(`${name} v${version}`);

const { genesis } = Block;
console.log(genesis.toString());

const block1 = Block.mine(genesis,'D4t4-1');
console.log(block1.toString());

const block2 = Block.mine(genesis,'D4t4-2');
console.log(block2.toString());
