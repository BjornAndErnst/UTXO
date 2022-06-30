const pcl = require('postchain-client');

const node_api_url = "http://localhost:7740";

const blockchainRID = "F006D6391F86C1E7245EF5F78330223710499AC40DB1F7F78068C1A76E839AB4";

const rest = pcl.restClient.createRestClient(node_api_url, blockchainRID, 5);

const gtx = pcl.gtxClient.createClient(
    rest,
    Buffer.from(blockchainRID, 'hex'),
    []
);

async function initialize(admin){
    const adminPubKey = pcl.util.toBuffer(admin.pubKey);
    const tx = gtx.newTransaction([admin.pubKey]);
    tx.addOperation("init", adminPubKey);
    tx.sign(admin.privKey, admin.pubKey);
    await tx.postAndWaitConfirmation();
}


async function transferbalance(fromUser, toUser, amount) {
    const fromUserPubKey = pcl.util.toBuffer(fromUser.pubKey); 
    const fromUserPrivKey = pcl.util.toBuffer(fromUser.privKey);
    const toUserPubKey = pcl.util.toBuffer(toUser.pubKey);
    const tx = gtx.newTransaction([fromUserPubKey]);

    let fromUserHexKey = fromUserPubKey.toString('hex');
    let toUserHexKey = toUserPubKey.toString('hex');
    
    tx.addOperation("transfer_calculator",fromUserHexKey,toUserHexKey,amount);
    tx.sign(fromUserPrivKey, fromUserPubKey);
    await tx.postAndWaitConfirmation();

}


async function getBalance(user){
    const UserPubKey = pcl.util.toBuffer(user.pubKey);
    let userHexKey = UserPubKey.toString('hex');
    return gtx.query("getAmount", {stringed_pubkey : userHexKey});
}

async function test(){

    const admin = pcl.util.makeKeyPair();
    const user1 = pcl.util.makeKeyPair();
    await initialize(admin);
    await transferbalance(admin,user1,1200);
    getBalance(admin);
    getBalance(user1);
    await transferbalance(user1,admin,1000);
    getBalance(admin); 
    getBalance(user1);

}

test();