import Blockchain from './blockchain';
import Block from './block';

describe('Blockchain', () => {
  let blockchain;
  let blockchain2;

  beforeEach(() => {
      blockchain = new Blockchain();
      blockchain2 = new Blockchain();
  });

  it('every blockchain have genesis', () => {
      const [genesisBlock] = blockchain.blocks;

      expect(genesisBlock).toEqual(Block.genesis);
      expect(blockchain.blocks.length).toEqual(1);

  });

  it('use add block', () => {
      const data = 'D4t4';
      blockchain.addBlock(data);

      const [,lastBlock] = blockchain.blocks;

      expect(lastBlock.data).toEqual(data);
      expect(blockchain.blocks.length).toEqual(2);

  });

  it('replace the chain whit valid other.', () => {

      blockchain2.addBlock('B10K3001');
      blockchain.replace(blockchain2.blocks);

      expect(blockchain.blocks).toEqual(blockchain2.blocks);
  });


  it('doesnt replace the because there are less blocks.', () => {

      blockchain.addBlock('B10K3001');

      expect(() => {
          blockchain.replace(blockchain2.blocks);
      }).toThrowError('Recived chain isnt longer than current chain.');
  });


  it('not replace the chain whit one invalid.', () => {

      blockchain2.addBlock('B10K3001');
      blockchain2.blocks[1].data = 'Bl0K-H4CK3D';

      expect(() => {
          blockchain.replace(blockchain2.blocks);
      }).toThrowError('Received chain is invalid.');
  });

});
