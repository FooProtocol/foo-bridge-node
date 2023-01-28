const ethers = require("ethers");
require("dotenv").config();





// =======================================
// CONSTANTS and VARIABLES
// =======================================
const PRIVATE_KEY = "";
const ERC20_TOKEN_controller = require("./controller/erc20.controller.json");





async function relayer() {
    console.log("Starting up relayer!");

    let FVM = {
        last_block_timestamp: 0,
        provider_uri: "https://api.hyperspace.node.glif.io/rpc/v1",
        provider: new ethers.providers.JsonRpcProvider("https://api.hyperspace.node.glif.io/rpc/v1"),
        chain_id: "3141",
        symbol: "tFil",
        explorer: "https://hyperspace.filfox.info/",
        vault_controller: require("./controller/fvm-vault.controller.json"),
        vault_address: ""
    }
    
    let BSC = {
        last_block_timestamp: 0,
        provider_uri: "https://endpoints.omniatech.io/v1/bsc/testnet/public",
        provider: new ethers.providers.JsonRpcProvider("https://endpoints.omniatech.io/v1/bsc/testnet/public"),
        chain_id: "97",
        symbol: "tBNB",
        explorer: "https://testnet.bscscan.com/",
        vault_controller: require("./controller/bsc-vault.controller.json"),
        vault_address: ""
    }

    let FVM_SIGNER = new ethers.Wallet(PRIVATE_KEY, FVM.provider);
    let BSC_SIGNER = new ethers.Wallet(PRIVATE_KEY, BSC.provider);

    console.log("SIGNERS SETUP IS COMPLETE");

    console.log("==================================");

    console.log("Connecting to the Vault Contract");

    let fvmVault = new ethers.Contract(FVM.vault_address, FVM.vault_controller, FVM_SIGNER);
    let bscVault = new ethers.Contract(BSC.vault_address, BSC.vault_controller, BSC_SIGNER);

    console.log("Contract connection has been established");

    const order_send_token_fvm = () => {

    }

    const order_send_token_bsc = () => {

    }


    fvmVault.on("Deposit", (token, bridger, value) => {
        try {
            order_send_token_bsc(token. bridger, value)
        } catch (err) {
            console.log("An Error Occurred while transferring token, chat with admin")
        }
    });

    bscVault.on("Deposit", (token, bridger, value) => {
        try {
            order_send_token_fvm(token. bridger, value)
        } catch (err) {
            console.log("An Error Occurred while transferring token, chat with admin")
        }
    });
}