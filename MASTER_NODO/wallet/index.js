import Transaction from './transaction';
import Wallet from './wallet';


import blockchain from '../service';
const blockchainWallet = new Wallet(blockchain,70000);



export { Transaction, blockchainWallet };
export default Wallet;
