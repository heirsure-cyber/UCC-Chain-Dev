// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/UCCChainRegistry.sol";

contract DeployUCCChainRegistry is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        UCCChainRegistry registry = new UCCChainRegistry();
        vm.stopBroadcast();
        console.log("UCCChainRegistry deployed to:", address(registry));
        console.log("Network: Polygon Mainnet (chainId 137)");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
    }
}
