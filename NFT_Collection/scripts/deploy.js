const hre = require("hardhat");
const pinataSDK = require('@pinata/sdk');


const pinata = pinataSDK('281117c607f2faaf946e', '3586e18ac8a08b51d0e348820879a87a91859f33bc22d707d1b8b0242d313369');
const { create , globSource } = require('ipfs-http-client')
const client = create(new URL('https://ipfs.infura.io:5001/api/v0'))

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
}
 
async function main() {
  var name = "";
  var symbol_nft = "";
  var description = "";
  var image_local = '';

  const data = new Buffer(fs.readFileSync(image_local));
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

  console.log("metadata", metadata);
  const nft = await hre.ethers.getContractFactory("Mint");
  const nft_deployed = await nft.deploy(metadata, name, symbol);

  await nft_deployed.deployed();
  console.log("NFT deployed suceesfully!", nft_deployed.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
