# Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
# Option A: Install both at once (requires concurrently)
npm install
npm run install-all

# Option B: Install manually
cd client
npm install
cd ../server
npm install
```

## Step 2: Configure Server

Create `.env` file in `server` folder:

```env
PORT=3001
NODE_ENV=development
```

Or copy the template:
```bash
cd server
copy env-template.txt .env
```

## Step 3: Start the Application

### Option A: Run Both Together (Recommended)

```bash
# From root directory
npm run dev
```

### Option B: Run Separately

```bash
# Terminal 1: Start Server
cd server
npm run dev

# Terminal 2: Start Client
cd client
npm run dev
```

## Step 4: Access the Application

- **Player Login**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **API Health Check**: http://localhost:3001/api/health

## Step 5: Test Login

Default credentials:
- **Player IDs**: P01 through P30
- **Passcodes**: P01-X through P30-X

Example:
- ID: `P01`
- Passcode: `P01-X`

## Step 6 (Optional): Generate QR Codes

For the kill mechanic to work, generate QR codes:

```bash
npm run generate-qr
```

QR codes will be saved in `server/qr-codes/` folder.
Print these and attach to players' backs during the event.

## Common Issues

### Port Already in Use

If you see "Port 3001 is already in use":

**Windows:**
```bash
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F
```

**Mac/Linux:**
```bash
lsof -ti:3001 | xargs kill -9
```

### Cannot Connect to Server

1. Ensure server is running (check Terminal 1)
2. Verify server is on port 3001
3. Check browser console for errors
4. Try refreshing the page

### QR Scanner Not Working

1. Grant camera permissions in browser
2. Ensure you're on HTTPS or localhost
3. Use good lighting
4. Print QR codes clearly

## Next Steps

1. Read [SETUP.md](./SETUP.md) for detailed configuration
2. Review [PROJECT_README.md](./PROJECT_README.md) for features overview
3. Check [server/README.md](./server/README.md) for API documentation
4. See [client/README.md](./client/README.md) for frontend details

## Testing the Game

### Test as a Player

1. Go to http://localhost:3000
2. Select P01, enter P01-X
3. Click "ENTER LOBBY"
4. Wait for game to start (or use admin to start)

### Test as Admin

1. Open http://localhost:3000/admin
2. Click "START GAME" to assign roles
3. Check the player list updates
4. Try "TRIGGER MEETING" and "START VOTING"
5. Use "RESET ALL DATA" to clear everything

## Task PINs

When the server starts, it generates random PINs for tasks. Check the server console output to see the PINs:

```
Database initialized
Task PINs: {
  'main-0': '1234',
  'main-1': '5678',
  ...
}
```

Use these PINs to verify tasks during testing. In production, set these up with Station Execs.

## Development Tips

- Server auto-restarts with nodemon when code changes
- Client hot-reloads when components change
- Check browser DevTools Console for errors
- Check server terminal for Socket.io events
- Use React DevTools for component debugging

## Ready for Production?

Before deploying for a real event:

1. ✅ Generate and print all QR codes
2. ✅ Set up custom task PINs
3. ✅ Prepare passcode sticky notes
4. ✅ Test with multiple devices
5. ✅ Set up on stable network
6. ✅ Have backup device ready
7. ✅ Brief Station Execs on PINs

Good luck with your event! 🎮
