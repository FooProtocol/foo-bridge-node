const ethers = require("ethers");
require("dotenv").config();
const PushAPI = require("@pushprotocol/restapi");
const { bridged_unsuccessfully, bridged_successfully } = require("./services/push.service");




// =======================================
// CONSTANTS and VARIABLES
// =======================================
const PRIVATE_KEY = "0x79d16440edc49e21afb88567cf6345a62edb8be8381f258cdc057a882becd91d";
const ERC20_TOKEN_controller = require("./controllers/erc20.controller.json");

const PUSH_OWNER_KEY = "0x5393eb89457505dc0cea935ef8f3e09b03ecc283234fff38fdf6c8a8d0ccf35a";
const PUSH_CHANNEL_ADDRESS = "eip155:5:0x5c919BCddA25447C168C87252326A43C709ECdBD";




async function relayer() {
    console.log("Starting up relayer!");

    let FVM = {
        last_block_timestamp: 0,
        provider_uri: "https://api.hyperspace.node.glif.io/rpc/v1",
        provider: new ethers.providers.JsonRpcProvider("https://api.hyperspace.node.glif.io/rpc/v1"),
        chain_id: "3141",
        symbol: "tFil",
        explorer: "https://hyperspace.filfox.info/",
        vault_controller: require("./controllers/fvm-vault.controller.json"),
        vault_address: "0x8aDB348e804BA72747E4B98DcE309AE830321D82"
    }
    
    let BSC = {
        last_block_timestamp: 0,
        provider_uri: "https://endpoints.omniatech.io/v1/bsc/testnet/public",
        provider: new ethers.providers.JsonRpcProvider("https://endpoints.omniatech.io/v1/bsc/testnet/public"),
        chain_id: "97",
        symbol: "tBNB",
        explorer: "https://testnet.bscscan.com/",
        vault_controller: require("./controllers/bsc-vault.controller.json"),
        vault_address: "0xc39BB8c60eAC33C107448E6041BC9dADb8e947C3"
    }

    let PUSH = {
        provider: new ethers.providers.JsonRpcProvider("https://eth-goerli.public.blastapi.io")
    }


    let FVM_SIGNER = new ethers.Wallet(PRIVATE_KEY, FVM.provider);
    let BSC_SIGNER = new ethers.Wallet(PRIVATE_KEY, BSC.provider);
    let PUSH_SIGNER = new ethers.Wallet(PUSH_OWNER_KEY, PUSH.provider);

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
            let gas_limit = await fvmVault.estimateGas.nodeTransferTokenOut(token, bridger, value, {
                from: FVM_SIGNER.address
            });

            let tx = await fvmVault.nodeTransferTokenOut(token, bridger, value, {
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
            let gas_limit = await bscVault.estimateGas.nodeTransferTokenOut(token, bridger, value, {
                from: BSC_SIGNER.address
            });

            let tx = await bscVault.nodeTransferTokenOut(token, bridger, value, {
                from: BSC_SIGNER.address,
                gasLimit: gas_limit.toString()
            })

            await tx.wait();

            console.log("Token has been sent");
            
        } catch (err) {
            console.log("Error", err);
        }
    }


    fvmVault.on("TokenDeposted", (token, bridger, value) => {
        try {
            order_send_token_bsc(token, bridger, value)
            bridged_successfully(PUSH_SIGNER, bridger, PUSH_CHANNEL_ADDRESS);
        } catch (err) {
            bridged_unsuccessfully(PUSH_SIGNER, bridger, PUSH_CHANNEL_ADDRESS);
            console.log("An Error Occurred while transferring token, chat with admin", err)
        }
    });

    bscVault.on("TokenDeposted", (token, bridger, value) => {
        try {
            order_send_token_fvm(token, bridger, value);
            bridged_successfully(PUSH_SIGNER, bridger, PUSH_CHANNEL_ADDRESS);
        } catch (err) {
            bridged_unsuccessfully(PUSH_SIGNER, bridger, PUSH_CHANNEL_ADDRESS);
            console.log("An Error Occurred while transferring token, chat with admin", err)
        }
    });


}

relayer();