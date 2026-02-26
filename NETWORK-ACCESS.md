# Access Pokedex from Tablet (same Wi‑Fi)

## 1. Start the server (if not already running)

From the Pokedex folder:

```powershell
cd C:\Users\Eisenholz\Desktop\Pokedex
npx serve .
```

**Serve already listens on all interfaces** (0.0.0.0:3000), so other devices on your network can connect.

## 2. Use your PC’s IP address

On your **tablet** (connected to the **same Wi‑Fi** as your PC), open the browser and go to:

- **http://192.168.1.15:3000**

(Replace with your PC’s current IP if it changes. See step 4 to check it.)

## 3. If the tablet can’t connect: allow the port in Windows Firewall

If the page doesn’t load, Windows Firewall may be blocking port 3000. Run **one** of these in **PowerShell as Administrator**:

**Option A – Allow Node (recommended if you only run Node dev servers):**
```powershell
New-NetFirewallRule -DisplayName "Node dev server" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

**Option B – Allow port 3000 only:**
```powershell
New-NetFirewallRule -DisplayName "Pokedex port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Then try **http://192.168.1.15:3000** again on the tablet.

## 4. If your PC’s IP changes

To see the current IPv4 address of your PC:

```powershell
ipconfig | findstr /i "IPv4"
```

Use the **192.168.x.x** address (your Wi‑Fi adapter). Then on the tablet open **http://&lt;that-IP&gt;:3000**.

---

**Summary:** Tablet and PC on same Wi‑Fi → tablet browser → **http://192.168.1.15:3000**
