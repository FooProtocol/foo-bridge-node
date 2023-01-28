const ethers = require("ethers");
require("dotenv").config();
const PushAPI = require("@pushprotocol/restapi");




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

    const order_send_token_fvm = async (token, bridger, value) => {
        try {
            console.log("Commanding send from FVM vault to " + bridger);

            // estimating gas 
            let gas_limit = await fvmVault.estimateGas.transfer(token, bridger, value, {
                from: FVM_SIGNER.address
            });

            let tx = await fvmVault.transfer(token, bridger, value, {
                from: FVM_SIGNER.address,
                gasLimit: gas_limit.toString()
            })

            await tx.wait();

            console.log("Token has been sent");
            
        } catch (err) {
            console.log("Error", err);
        }
    }

    const order_send_token_bsc = async (token, bridger, value) => {
        try {
            console.log("Commanding send from BSC vault to " + bridger);

            // estimating gas 
            let gas_limit = await bscVault.estimateGas.transfer(token, bridger, value, {
                from: BSC_SIGNER.address
            });

            let tx = await bscVault.transfer(token, bridger, value, {
                from: BSC_SIGNER.address,
                gasLimit: gas_limit.toString()
            })

            await tx.wait();

            console.log("Token has been sent");
            
        } catch (err) {
            console.log("Error", err);
        }
    }


    fvmVault.on("Deposit", (token, bridger, value) => {
        try {
            order_send_token_bsc(token. bridger, value)
        } catch (err) {
            console.log("An Error Occurred while transferring token, chat with admin", err)
        }
    });

    bscVault.on("Deposit", (token, bridger, value) => {
        try {
            order_send_token_fvm(token. bridger, value)
        } catch (err) {
            console.log("An Error Occurred while transferring token, chat with admin", err)
        }
    });
}

relayer();