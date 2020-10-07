import express from 'express';
import bodyParser from 'body-parser';
const mysql = require('mysql');
import { SHA256 } from 'crypto-js';
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "criptocoin_db",
  socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
});

import Blockchain from '../blockchain';
import Wallet from '../wallet';
import P2PService, { MESSAGE } from './p2p';
import Miner from '../miner';

import { Transaction,blockchainWallet } from '../wallet';


const { HTTP_PORT = 3000 } = process.env;

const app = express();
const blockchain = new Blockchain();
var all_wallets = [];


// Primera Wallet que se crea al levantar servicio
//const wallet =  new Wallet(blockchain,70000);
//all_wallets.push(wallet);



const walletMiner =  new Wallet(blockchain,0);
all_wallets.push(walletMiner);
const p2pService = new P2PService(blockchain);
const miner = new Miner(blockchain,p2pService,walletMiner);

app.use(bodyParser.json());

// ************ RUTAS BLOCKCHAIN ****************************************
app.get('/blocks', (req, res) => {
  res.json(blockchain.blocks);
});





// Obtener Wallet y balance del minero
app.get('/miner_balance', (req, res) => {
  res.json({
    wallet:walletMiner.publicKey,
    balance:walletMiner.currentBalance,
    });
});



// Obtener Wallet y balance del minero
app.get('/blockchain_wallet', (req, res) => {
  res.json({
    wallet:blockchainWallet.publicKey,
    balance:blockchainWallet.currentBalance,
    });
});



app.post('/wallet',(req,res) => {
    initialBalance = req.body.ini;
    const wallet2 = new Wallet(blockchain,initialBalance);
    all_wallets.push(wallet2);
    const { publicKey } = all_wallets[all_wallets.length - 1];
    res.json(publicKey);
});




app.post('/mine', (req, res) => {
  const { body: { data } } = req;
  const block = blockchain.addBlock(data);

  p2pService.sync();

  res.json({
    blocks: blockchain.blocks.length,
    block,
  });
});

app.get('/transactions', (req, res) => {
   const { memoryPool: { transactions }} = blockchain;
   res.json(transactions);
});

app.post('/transaction', (req, res) => {
  const { body: { recipient,amount }} =  req;

  try{
    const tx = wallet.createTransaction(recipient,amount);
    p2pService.broadcast(MESSAGE.TX,tx);
    res.json(tx);
  }catch (error){
    res.json({ error: error.message });
  }
});

app.get('/mine/transactions', (req, res) => {
   try{
     miner.mine();


     res.redirect('/blocks');
   }catch (error){
     res.json({ error: error.message,dos:'here' });
   }
});

app.get('/wallet_explore', (req, res) => {
  var w = [];
  all_wallets.forEach(element => w.push( { wallet:element.publicKey , balance:element.balance } ));
  res.json(w);
});

app.post('/transaction_from_to', (req, res) => {
  const { body: { from,recipient,amount }} =  req;

  try{
    const tx = wallet.createTransaction_from_to(from,recipient,amount);
    p2pService.broadcast(MESSAGE.TX,tx);
    res.json(tx);
  }catch (error){
    res.json({ error: error.message });
  }
});

















// ************ RUTAS USERS ****************************************
// 1- login a cuenta wallet
app.post('/login',(req,res) => {
  const pass = SHA256(JSON.stringify(req.body.pass)).toString();
  // 5 Segundos para encontrar de lo contrario no encontrado
  res.setTimeout(5000, function(){
            res.json({ error: 'User not found.' });
        });
  // Busca de usuario en DataBase
  con.query("SELECT * FROM users WHERE nick_name = '"+req.body.nick_name+"' AND blockchain_passcode = '"+pass+"'", function (err, result, fields){
  if (err) throw err;
        Object.keys(result).forEach(function(key) {
          var row = result[key];
          res.json({ name: row.name, nick_name:row.nick_name, wallet: row.wallet, balance: row.balance, currency: row.currency, balance: row.saldo })
        });
  });
});
// 2- Crea una wallet para usuario de blockchain
app.post('/make_wallet',(req,res) => {
  const pass = SHA256(JSON.stringify(req.body.pass)).toString();
  // 5 Segundos para encontrar de lo contrario no encontrado
  res.setTimeout(5000, function(){ res.json({ error: 'Unauthenticated.' });  });
  // Busca de usuario en DataBase
        const new_wallet = new Wallet(blockchain,req.body.balance);
        all_wallets.push(new_wallet);
        const { publicKey } = all_wallets[all_wallets.length - 1];
        res.json({ wallet_key:publicKey });
});

// 3- Realiza una transaccion de usuario peticion a usuario destino
app.post('/transaction_me_to', (req, res) => {
  const { body: { recipient,amount }} =  req;
  try{
    const tx = all_wallets[req.body.ide].createTransaction(recipient,amount);
    p2pService.broadcast(MESSAGE.TX,tx);
    res.json(tx);
  }catch (error){
    res.json({ error: error.message });
  }
});

// 4- Generador de codigo de acceso para blockchain
app.post('/request_passcode',(req,res) => {
    const pass = SHA256(JSON.stringify(req.body.pass)).toString();
    res.json({ password:pass });
});




// 4- Generador de codigo de acceso para blockchain
app.post('/get_balance',(req,res) => {
    var currentBalance = Wallet.toString();
    res.json({ balance:currentBalance });
});





// 4- Generador de codigo de acceso para blockchain
app.post('/recupera_wallet',(req,res) => {
    const { publicKey } = all_wallets[req.body.ide];
    res.json({ key:publicKey });
});






// ************ LEVANTAMOS SERVIDOR ****************************************
app.listen(HTTP_PORT, () => {
  console.log(`Service HTTP:${HTTP_PORT} listening...`);
  p2pService.listen();
});

export default blockchain;
