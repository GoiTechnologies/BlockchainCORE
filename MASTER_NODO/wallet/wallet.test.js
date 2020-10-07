import Wallet, { INITIAL_BALANCE } from './wallet';
import Blockchain from '../blockchain';


describe('Wallet', () => {
    let wallet;
    let blockchain;

    beforeEach(() =>{
          blockchain = new Blockchain();
          wallet = new Wallet(blockchain);
    });

    it('This is a correct wallet', () => {
        expect(wallet.balance).toEqual(INITIAL_BALANCE);
        expect(typeof wallet.keyPair).toEqual('object');
        expect(typeof wallet.publicKey).toEqual('string');
        expect(wallet.publicKey.length).toEqual(130);
    });

    it('use sign()', () => {
        const signature = wallet.sign('H3110');
        expect(typeof signature).toEqual('object');
        expect(signature).toEqual(wallet.sign('H3110'));
    });


    describe('creating a transaction.', () => {
        let tx;
        let recipientAddress;
        let amount;

        beforeEach(() =>{
              recipientAddress = 'My-R4NDOM-ADR33SS';
              amount = 5;
              tx = wallet.createTransaction(recipientAddress, amount);
        });


          describe('and doing the same transaction', () => {
            beforeEach(() =>{
                  tx = wallet.createTransaction(recipientAddress, amount);
            });


            it('double the amount substract from the wallet balance.', () => {
                const output = tx.outputs.find(({ address }) => address === wallet.publicKey);
                expect(output.amount).toEqual(wallet.balance - (amount * 2));
            });

            it('clone the amount output for the recipient.', () => {
                const amounts = tx.outputs.filter(({ address }) => address === recipientAddress).map((output) => output.amount);
                expect(amounts).toEqual([amount,amount]);
            });
        });
    });



    describe('calculating the current balance', () => {
      let addBalance;
      let times;
      let senderWallet;

      beforeEach(() => {
        addBalance = 16;
        times = 3;
        senderWallet = new Wallet(blockchain);

        for (let i = 0; i < times; i += 1) {
          senderWallet.createTransaction(wallet.publicKey, addBalance);
        }

        blockchain.addBlock(blockchain.memoryPool.transactions);
      });

      it('calculates the balance for blockchain txs matching the recipient', () => {
        expect(wallet.currentBalance).toEqual(INITIAL_BALANCE + (addBalance * times));
      });

      it('calculates the blaance for blockchain txs matching the sender', () => {
        expect(senderWallet.currentBalance).toEqual(INITIAL_BALANCE - (addBalance * times));
      });

      describe('and the recipient conducts a transaction', () => {
        let subtractBalance;
        let recipientBalance;

        beforeEach(() => {
          blockchain.memoryPool.wipe();
          subtractBalance = 64;
          recipientBalance = wallet.currentBalance;

          wallet.createTransaction(senderWallet.publicKey, addBalance);

          blockchain.addBlock(blockchain.memoryPool.transactions);
        });

        describe('and the sender sends another transaction to the recipient', () => {
          beforeEach(() => {
            blockchain.memoryPool.wipe();
            senderWallet.createTransaction(wallet.publicKey, addBalance);

            blockchain.addBlock(blockchain.memoryPool.transactions);
          });

          it('calculate the recipient balance only using txs since its most recent one', () => {
            expect(wallet.currentBalance).toEqual(recipientBalance - subtractBalance + addBalance);
          });
        });
      });
    });
 });
