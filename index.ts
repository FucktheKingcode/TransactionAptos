import {
    Account,
    Aptos,
    AptosConfig,
    Network,
    AccountAddress,
    CreateEd25519AccountFromPrivateKeyArgs,
    Ed25519Account,
    Ed25519PrivateKey,
    Ed25519PublicKey,
  } from "@aptos-labs/ts-sdk";
  
  const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
  const COIN_STORE = `0x1::coin::CoinStore<${APTOS_COIN}>`;
  const TRANSFER_AMOUNT = 100_000_000;
  
  // Hàm kiểm tra tài khoản trong một address
  const balance = async (aptos: Aptos, name: string, address: AccountAddress) => {
    type Coin = { coin: { value: string } };
    const resource = await aptos.getAccountResource<Coin>({
      accountAddress: address,
      resourceType: COIN_STORE,
    });
    const amount = Number(resource.coin.value);
  
    console.log(`${name}'s balance is: ${amount}`);
    return amount;
  };
  
  async function example() {
    console.log(
      "Ví dụ này sẽ tạo hai tài khoản (Alice và Bob), nạp tiền vào chúng, và chuyển tiền giữa chúng."
    );
  
    // Thiết lập client
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);
  
    // Tạo hai tài khoản
    const alicePrivateKey = new Ed25519PrivateKey("YOUR_ALICE_PRIVATEKEY");
    const alice = new Ed25519Account({ privateKey: alicePrivateKey });
    const bobPrivateKey = new Ed25519PrivateKey("<YOUR_BOB_PRIVATEKEY>");
    const bob = new Ed25519Account({ privateKey: bobPrivateKey });
    console.log("=== Địa chỉ ===\n");
    console.log(`Địa chỉ của Alice là: ${alice.publicKey}`);
    console.log(`Địa chỉ của Bob là: ${bob.publicKey}`);
  
    // Kiểm tra số dư
    console.log("\n=== Số dư ===\n");
    const aliceBalance = await balance(aptos, "Alice", alice.accountAddress);
    console.log(`Số dư của Alice là: ${aliceBalance}`);
  
    const bobBalance = await balance(aptos, "Bob", bob.accountAddress);
    console.log(`Số dư của Bob là: ${bobBalance}`);
  
    // Chuyển tiền từ Alice sang Bob
    console.log("\n=== Đang thực hiện giao dịch chuyển tiền ===\n");
    const transaction = await aptos.transaction.build.simple({
      sender: alice.accountAddress,
      data: {
        function: "0x1::aptos_account::transfer",
        typeArguments: [],
        functionArguments: [bob.accountAddress, TRANSFER_AMOUNT],
      },
    });
  
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: alice,
      transaction,
    });
  
    const executedTxn = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    console.log("Hash giao dịch:", executedTxn.hash);
  
    // Kiểm tra số dư sau khi chuyển tiền
    console.log("\n=== Số dư sau khi chuyển tiền ===\n");
    const newAliceBalance = await balance(aptos, "Alice", alice.accountAddress);
    console.log(`Số dư mới của Alice là: ${newAliceBalance}`);
  
    const newBobBalance = await balance(aptos, "Bob", bob.accountAddress);
    console.log(`Số dư mới của Bob là: ${newBobBalance}`);
  
    console.log("\nGiao dịch thành công!");
  }
  
  // Chạy ví dụ
  example().catch((error) => {
    console.error("Có lỗi xảy ra:", error);
    process.exit(1);
  });
  