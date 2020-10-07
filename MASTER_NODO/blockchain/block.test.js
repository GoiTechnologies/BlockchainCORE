import Block , { DIFFICULTY } from './block';

describe('Block', () => {
  let timestamp;
  let previousBlock;
  let data;
  let hash;
  let nonce;


  beforeEach(() =>{
      timestamp = new Date(2000,0,1);
      previousBlock = Block.genesis;
      data = 'T3ST333';
      hash = 'H$ASddTEST';
      nonce = 128;
  });

  it('create an instance whit parameters', () => {
      const block = new Block(timestamp,previousBlock.hash,hash,data, nonce);

      expect(block.timestamp).toEqual(timestamp);
      expect(block.previousHash).toEqual(previousBlock.hash);
      expect(block.data).toEqual(data);
      expect(block.hash).toEqual(hash);
      expect(block.nonce).toEqual(nonce);
  });


  it('uso static mine', () => {
      const block = Block.mine(previousBlock,data);
      const { difficulty } = block;

      expect(block.hash.length).toEqual(64);
      expect(block.hash.substring(0, difficulty)).toEqual('0'.repeat(difficulty));
      expect(block.previousHash).toEqual(previousBlock.hash);
      expect(block.nonce).not.toEqual(0);
      expect(data).toEqual(data);
  });



  it('uso static hash', () => {
      hash = Block.hash(timestamp,previousBlock.hash,data,nonce);
      const hasOutput = '912aec8fcb3508fb9157c4b96fb05f93f327ba5444db9e756bc5f901ed6ad45a';

      expect(hash).toEqual(hasOutput);
  });


  it('uso toString()', () => {
        const block = new Block.mine(previousBlock,data);

        console.log(block.toString());
        expect(typeof block.toString()).toEqual('string');
  });

});
