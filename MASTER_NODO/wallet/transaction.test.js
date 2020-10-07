import Transaction, { REWARD } from './transaction';
import Wallet from './wallet';
import { blockchainWallet } from './index';


describe('Transaction', () => {
    let wallet;
    let transaction;
    let amount;
    let recipientAddress;

    beforeEach(() =>{
          wallet = new Wallet();
          recipientAddress = 'R3C1P13NT';
          amount = 5;
          transaction = Transaction.create(wallet,recipientAddress,amount);
    });

    it('Outputs the amount substracted from the wallet balance', () => {
        const output = transaction.outputs.find(({address}) => address === wallet.publicKey);

        expect(output.amount).toEqual(wallet.balance - amount);
    });

    it('Outputs the amount added to the recipient.', () => {
        const output = transaction.outputs.find(({address}) => address === recipientAddress);

        expect(output.amount).toEqual(amount);
    });


    describe('Transaction whit an amount exceded', () => {


          beforeEach(() =>{
                amount = 500;
                transaction = undefined;
          });


          it('doesnt create transaction.', () => {
            expect(() => {
                transaction = Transaction.create(wallet,recipientAddress,amount);
            }).toThrowError(`Amount: ${amount} excceds balance.`);
          });
    });



    it('Inputs the balance of the wallet', () => {
        expect(transaction.input.amount).toEqual(wallet.balance);
    });


    it('Inputs the sender address of the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
    });


    it('Inputs has a signature using the wallet.', () => {
        expect(typeof transaction.input.signature).toEqual('object');
        expect(transaction.input.signature).toEqual(wallet.sign(transaction.outputs));
    });

    it('Inputs has a signature using the wallet.', () => {
        expect(typeof transaction.input.signature).toEqual('object');
        expect(transaction.input.signature).toEqual(wallet.sign(transaction.outputs));
    });

    it('validate a valid transaction', () => {
        expect(Transaction.verify(transaction)).toBe(true);
    });

    it('validate a valid transaction', () => {
      transaction.outputs[0].amount = 500;
      expect(Transaction.verify(transaction)).toBe(false);
    });




    describe('and updating a transaction.', () => {
          let nextAmount;
          let nextRecipient;

          beforeEach(() =>{
                nextAmount = 3;
                nextRecipient = 'N3xT-4DR3SS';
                transaction = transaction.update(wallet,nextRecipient,nextAmount);
          });


          it('substract the next amount from sender wallet.', () => {
            const output = transaction.outputs.find(({address}) => address === wallet.publicKey);
            expect(output.amount).toEqual(wallet.balance - amount - nextAmount);
          });


          it('outputs and amount for the next recipient.', () => {
            const output = transaction.outputs.find(({address}) => address === nextRecipient);
            expect(output.amount).toEqual(nextAmount);
          });
    });




    describe('creating a reward transaction.', () => {
          beforeEach(() =>{
                transaction = Transaction.reward(wallet,blockchainWallet);
          });

          it('reward the miner wallet.', () => {
            expect(transaction.outputs.length).toEqual(2);

            let output = transaction.outputs.find(({ address }) => address === wallet.publicKey);
            expect(output.amount).toEqual(REWARD);

            output = transaction.outputs.find(({ address }) => address === blockchainWallet.publicKey);
            expect(output.amount).toEqual(blockchainWallet.balance - REWARD);
          });
        });

 });
