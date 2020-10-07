import Blockchain from '../blockchain';
import validate from './validate';


describe('validate()', () => {
  let blockchain;


  beforeEach(() => {
      blockchain = new Blockchain();
  });

  it('validate a valid chain', () => {
      blockchain.addBlock('B1oK-1');
      blockchain.addBlock('B1oK-2');

      expect(validate(blockchain.blocks)).toBe(true);
  });

  it('inavlidates a chain whit corrupt genesis block', () => {
      blockchain.blocks[0].data = 'bad-D4ta';

      expect(() => {
          validate(blockchain.blocks);
      }).toThrowError('Invalid a genesis block.');
  });

  it('inavlidates a chain whit corrupt previous hash in block', () => {
      blockchain.addBlock('B1oK-1');
      blockchain.blocks[1].previousHash = 'H4Ck3R';
      expect(() => {
          validate(blockchain.blocks);
      }).toThrowError('Invalid previous Hash.');
  });

  it('inavlidates a chain whit corrupt hash in block', () => {
      blockchain.addBlock('B1oK-1');
      blockchain.blocks[1].hash = 'H4Ck3R';
      expect(() => {
          validate(blockchain.blocks);
      }).toThrowError('Invalid hash.');
  });

});
