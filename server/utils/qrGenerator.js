const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

// Generate QR codes for all players
async function generatePlayerQRCodes() {
  const qrDir = path.join(__dirname, '../qr-codes')
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true })
  }

  // Generate QR code for each player (P01 to P30)
  for (let i = 1; i <= 30; i++) {
    const playerId = `P${i.toString().padStart(2, '0')}`
    const qrPath = path.join(qrDir, `${playerId}.png`)
    
    try {
      await QRCode.toFile(qrPath, playerId, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      console.log(`Generated QR code for ${playerId}`)
    } catch (err) {
      console.error(`Error generating QR code for ${playerId}:`, err)
    }
  }

  console.log('All QR codes generated successfully!')
  console.log(`QR codes saved to: ${qrDir}`)
}

// Run if called directly
if (require.main === module) {
  generatePlayerQRCodes()
}

module.exports = { generatePlayerQRCodes }
