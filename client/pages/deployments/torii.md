# Torii Indexer Deployment Guide

This guide provides step-by-step instructions for deploying Torii indexer on both **Sepolia testnet** and **Mainnet**. The deployment process is nearly identical for both networks, with only network-specific configurations differing.

## Prerequisites

Before deploying Torii, ensure you have:

### Deployed Contracts
- Your Dojo world contracts must be deployed and ready to index
- Have your deployed world address available

*Note: This guide focuses on Torii deployment. Refer to the appropriate contract deployment guides if you haven't deployed your world contracts yet.*

## Environment Setup

No special funding is required for Torii deployment itself, as Torii runs as an indexing service that reads blockchain data.

## World Configuration

Ensure your world is properly configured in the appropriate configuration file:

### Sepolia Configuration (`dojo_sepolia.toml`)
```toml
[world]
seed = "tamagotchi1"  # Change to "tamagotchi2", etc. for new world
```

### Mainnet Configuration (`dojo_mainnet.toml`)
```toml
[world]
seed = "tamagotchi1"  # Change to "tamagotchi2", etc. for new world
```

> 💡 **Tip**: Each unique seed generates a different world address when contracts are deployed.

## Network-Specific Configuration

Choose the appropriate RPC URL for your target network:

### Sepolia Testnet
```bash
export STARKNET_RPC_URL="https://starknet-sepolia.public.blastapi.io/rpc/v0_8"
```

### Mainnet
```bash
export STARKNET_RPC_URL="https://api.cartridge.gg/x/starknet/mainnet"
```

## Torii Configuration File

Create a `torii-config.toml` file with the following template:

```toml
# The World address to index (replace with your deployed world address)
world_address = "YOUR_WORLD_ADDRESS"

# RPC URL - Network specific (use appropriate URL from above)
rpc = "NETWORK_RPC_URL"

[indexing]
allowed_origins = ["*"]
transactions = true
pending = true
polling_interval = 1000
contracts = []

[events]
raw = true

[sql]
historical = ["tamagotchi-TrophyProgression"]
```

### Configuration Parameters Explained

- **`world_address`**: The address of your deployed Dojo world
- **`rpc`**: The RPC endpoint for your target network
- **`allowed_origins`**: CORS origins (use `["*"]` for development, restrict for production)
- **`transactions`**: Enable transaction indexing
- **`pending`**: Include pending transactions
- **`polling_interval`**: How often to poll for new data (milliseconds)
- **`historical`**: Specific historical data to index

## Deployment Steps

### 1. Authenticate with Slot

First, log in to your Slot account:

```bash
slot auth login
```

### 2. Create New Torii Instance

Deploy a new Torii indexer instance:

```bash
slot d create torii \
  --sql.historical "tamagotchi-TrophyProgression" \
  --config "./torii-config.toml" \
  --version v1.5.1
```

### Command Parameters:
- **`--sql.historical`**: Specify historical data to index
- **`--config`**: Path to your Torii configuration file
- **`--version`**: Torii version to deploy (check latest releases)

### 3. Verify Deployment

Check your Torii deployment status:

```bash
slot d describe torii
```

This command will show:
- Deployment status
- Endpoint URL
- Configuration details
- Resource usage

## Updating Existing Torii Instance

To update an existing Torii instance with new configuration:

```bash
slot d update torii --config "./torii-config.toml"
```

> 📝 **Note**: Updates will apply the new configuration and restart the indexer.

## Network-Specific Examples

### Complete Sepolia Example

```bash
# 1. Create torii-config.toml with Sepolia RPC
# world_address = "0x..." # Your deployed world address
# rpc = "https://starknet-sepolia.public.blastapi.io/rpc/v0_8"

# 2. Deploy Torii
slot auth login
slot d create torii \
  --sql.historical "tamagotchi-TrophyProgression" \
  --config "./torii-config.toml" \
  --version v1.5.1
```

### Complete Mainnet Example

```bash
# 1. Create torii-config.toml with Mainnet RPC
# world_address = "0x..." # Your deployed world address
# rpc = "https://api.cartridge.gg/x/starknet/mainnet"

# 2. Deploy Torii
slot auth login
slot d create torii \
  --sql.historical "tamagotchi-TrophyProgression" \
  --config "./torii-config.toml" \
  --version v1.5.1
```

## Common Troubleshooting

### Issue: "World address not found"
**Solution**: 
1. Verify your world was deployed successfully
2. Check the world address in your deployment output
3. Ensure you're using the correct network RPC

### Issue: "RPC connection failed"
**Solution**: 
1. Verify the RPC URL is correct for your network
2. Check your internet connection
3. Try alternative RPC endpoints if available

### Issue: Torii not indexing data
**Solution**:
1. Verify your world address is correct
2. Check that transactions are being sent to the world
3. Review Torii logs using `slot d logs torii`

### Issue: Configuration file not found
**Solution**:
1. Ensure `torii-config.toml` is in the correct directory
2. Verify the file path in the deployment command
3. Check file permissions

## Version Management

To use the latest Torii version:

1. Check available versions: [Dojo Releases](https://github.com/dojoengine/dojo/releases)
2. Update your deployment command with the new version:

```bash
slot d create torii \
  --sql.historical "tamagotchi-TrophyProgression" \
  --config "./torii-config.toml" \
  --version v1.6.0  # Updated version
```

## Security Considerations

### Production Deployments
- Restrict `allowed_origins` to specific domains
- Use environment variables for sensitive configuration
- Regularly update to the latest Torii version
- Monitor resource usage and access logs

### Configuration Best Practices
```toml
# Production example
[indexing]
allowed_origins = ["https://yourdapp.com", "https://www.yourdapp.com"]
transactions = true
pending = false  # Disable for production stability
polling_interval = 5000  # Longer interval for production
```

## Next Steps

After successful Torii deployment:

1. **Test your indexer**: Query your Torii endpoint to ensure data is being indexed
2. **Monitor performance**: Use `slot d describe torii` to check resource usage
3. **Update your frontend**: Point your dApp to the new Torii endpoint
4. **Set up monitoring**: Consider setting up alerts for your Torii instance

## Additional Resources

- [Dojo Book - Torii](https://book.dojoengine.org/toolchain/torii)
- [Dojo By Example](https://github.com/AkatsukiLabs/DojoByExample)
- [Starknet RPC Documentation](https://docs.starknet.io/ecosystem/overview/)
- [Slot Documentation](https://docs.cartridge.gg/slot)

---

> 💡 **Remember**: The deployment process is identical for both Sepolia and Mainnet - only the RPC URL and network-specific configurations differ. Always test on Sepolia before deploying to Mainnet.