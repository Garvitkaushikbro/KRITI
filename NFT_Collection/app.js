// General Backend Dependencies Start ---------------------------------------------
const fs = require('fs');

// General Backend Dependencies End---------------------------------------------


// Blockchain Dependencies Start --------------------------------------------

const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx').Transaction;
const rpcURL = 'https://rpc-mainnet.maticvigil.com/v1/4126807acec50894a1cf21fdbce7c959d52f6d11';
const web3 = new Web3(rpcURL);
const hre = require("hardhat");

// const IPFS = require('ipfs-core');
// const { create } = require('ipfs-http-client');

// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
const { create , globSource } = require('ipfs-http-client')
const client = create(new URL('https://ipfs.infura.io:5001/api/v0'))
// const { globSource } = require('ipfs')

const pinataSDK = require('@pinata/sdk');
// const pinataSDK = require('@pinata/sdk');

const pinata = pinataSDK('281117c607f2faaf946e', '3586e18ac8a08b51d0e348820879a87a91859f33bc22d707d1b8b0242d313369');

const pubKey = "0x9fAFEfa911e1081E7874088B92a0947BB555fd49";
// let address = '0x9fAFEfa911e1081E7874088B92a0947BB555fd49';
const privKey = '95121b1a2cbe11cff965a3778d09018c76a981e1713e79ed965cd2c1bf98620b';


// Blockchain Dependencies End --------------------------------------------

const upload_image_on_ipfs = async (data) => {
    var { cid , path} = await client.add(data, function(err, file){
      if(err){
        throw err;
        // check this once 
      }else{
        console.log(file);
      }
    });
  
    return {cid, path};
}

const upload_metadata_on_ipfs = async (name, description, image_path) => {
  const result = JSON.stringify({name, description, image: image_path});
  var { cid , path } = await client.add(result);
  console.log("===================")
  console.log(cid);
  console.log(path);
  console.log("===================")

  return { cid , path };
}

const pinning_using_pinata = async (path) => {
  await pinata.pinByHash(path);
// pinata.pinByHash(path).then((result) => {
//   //handle results here
//   console.log("hi there testing pinata");
//   console.log(result);
//   }).catch((err) => {
//       //handle error here
//       console.log(err);
//   });
}

async function deploy_smartcontract(metadata, name, description, cap, price, image_url){

      console.log("====================");
      console.log(metadata);
      console.log(image_url);
      console.log(name);
      console.log(description);
      console.log(cap);
      console.log(price);
      console.log(image_url);
      console.log("====================");
    
      var abi = require("../artifacts/contracts/Mint.sol/Mint.json").abi;
      const MintNFT = await hre.ethers.getContractFactory("Mint");
      var bytecode = MintNFT.bytecode;
      var contract_address;
      console.log(abi);
    

      let deploy_contract = new web3.eth.Contract(abi);
      
      // Deploy contract
    console.log('Attempting to deploy from account:', pubKey);
    const incrementer = new web3.eth.Contract(abi);
    const incrementerTx = incrementer.deploy({
         data: bytecode,
         arguments: [metadata, cap],
      });
    const createTransaction = await web3.eth.accounts.signTransaction(
         {
            from: pubKey,
            data: incrementerTx.encodeABI(),
            gas: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()),
         },
         privKey
      );
    const createReceipt = await web3.eth.sendSignedTransaction(
         createTransaction.rawTransaction
      );
      console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
      console.log(createReceipt);
      console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
      console.log('Contract deployed at address', createReceipt.contractAddress);
      console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
      var contract_address = createReceipt.contractAddress;
      console.log(createReceipt.transactionHash);
     
    return contract_address;
}

try{
    var name = fields.name[0];
    var description = fields.description[0];
    var price = parseInt(fields.price[0]);
    var image_local = image_object.image[0].path;

    const data = new Buffer(fs.readFileSync(image_object.image[0].path));
    var { cid, path } = await upload_image_on_ipfs(data);
    await pinning_using_pinata(path);

    console.log(cid);
    console.log(image_url);
    path = "ipfs://" + path + "/";
    var image_path = path;
    console.log(image_path);

    var { cid, path } = await upload_metadata_on_ipfs(name, description, image_path);
    await pinning_using_pinata(path);

    console.log("deploying smart contract on blockchain");
    const metadata = 'ipfs://'+ path + '/';
    var contract_address = await deploy_smartcontract(metadata, name, description, cap, price, image_url);
    console.log(contract_address);
} catch (err) {
    console.log(err);
    res.status(400).json({ err });
}
