import Block from '../block';

export default (blockchain) => {
      const [genesisBlock, ...blocks] = blockchain;

      if(JSON.stringify(genesisBlock) !== JSON.stringify(Block.genesis)) throw Error('Invalid a genesis block.');

      for(let i = 0; i < blocks.length; i +=1){
          const {
            previousHash,timestamp,hash,data,nonce,difficulty
          } = blocks[i];
          const previousBlock = blockchain[i];

          if(previousHash !== previousBlock.hash) throw Error('Invalid previous Hash.');
          if(hash !== Block.hash(timestamp,previousHash,data,nonce,difficulty)) throw Error('Invalid hash.');
      }

      return true;
}
