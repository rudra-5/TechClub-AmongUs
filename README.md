Among Us Website Plan

This document provides a breakdown of the UI and UX. 
Please Note:
All screens are reactive. If the Admin triggers Meeting Mode, all player screens must instantly and automatically navigate to the Voting UI via webssocket events.
Theme (general idea) but need to use tech club colours (#977DFF medium-light purple, #D4CDFF light lavender, #1B1C2E soft black, #79F0F8 bright cyan, #E2FDFD pale blue, and #0B054F navy blue):
	Crewmate: Blue/Green/White (Safe, Clean). 
	Imposter: Red/Black/Dark Grey (Danger).
	Ghost: Grey/Translucent (Inactive).
	Admin: Neutral/Dashboard style.

1)	Login Screen (Public Landing Page)
For all Players (New round start).
Since we have multiple rounds of 30 people, ID (P01 to P30) are reused. The system must allow "Player 01" to log in for Round 1, then reset, and allow a new person to log in as "Player 01" for Round 2.
•	Header: Event Logo / Title. And club logo
•	Input Fields:
o	Player ID: Dropdown Menu (Select P01 through P30).
o	Passcode: simple code (e.g "P01-X"), (we’ll put on sticky notes at host room)
•	Action Button: ENTER LOBBY.
Onclick, checks if the game is currently "Active" or "Waiting." Fetches assigned role (imposter/crew) from the backend for the current round.



2. The Lobby (Waiting Room)
For All Players (Before Host starts timer).
•	Center Text saying "Waiting for Host to Start..."
•	Player Card displays their ID (e.g., "PLAYER 05").
•	Role Indicator is HIDDEN and Text: "Role Restricted."
•	Visual effect is pulsing animation or countdown placeholder.

3. Crewmate Game Dashboard (Alive)
A.  Header (Fixed at Top)
•	Identity Badge: "YOU ARE A CREWMATE”.
•	Global Progress Bar: Large, green bar spanning width. Shows total % of tasks completed by all Crewmates.
•	Game Timer: Countdown 30 mins. Synced with Server.
B. Body (Scrollable Task List)
•	Section Title: "Your Tasks".
•	Task Cards.. list of items.
o	Visual is box containing Task Name (e.g., "Fix Wiring") and Room Name (e.g, "Opal Room").
o	Status Icon can be Empty Circle (Pending) or Green Check (Done).
Clicking a pending task opens the Verification Pinpad modal.
C. Verification Pinpad Modal Overlay
•	Trigger: Player clicks a specific task card.
•	Text: Ask Station Exec to enter PIN.
•	Input: 4-digit keypad.
If PIN correct: Close modal, mark task complete, update Global Progress Bar (the % of bar filled per task is based on Main vs Filler task weight e.g a main task per person contributes 5 percent filler is 2 percent).
If PIN incorrect: Shake animation / "Invalid PIN".
4. Imposter Game Dashboard (Alive)
A. Header (Fixed at Top)
•	Identity Badge.. YOU ARE AN IMPOSTER(Red/Black).
•	Teammate List, small text below badge: "allies: P04, P09, P12." (So they can coordinate with each other).
•	Global Progress Bar: Same as Crewmates (so they know how close crew is to winning).
•	Game Timer: Same as crewmates..
B. Action Area (The Kill Button)
	Location of button: Bottom Right Floating Action Button or large centerr button.
	Label: KILL (Skull/Knife icon).
	State - Ready: Blood red and clickable.
	State - Cooldown: Greyed out, and overlay shows countdown timer (5 mins long, after a kill).
	Interaction: Clicking KILL opens the QR Scanner Overlay.
C. QR Scanner Overlay
	View: Full-screen camera view.
	Overlay: Square guide box in center.
	Logic:
1.	Scans QR code on victim's back.
2.	Success: Vibrate phone, close camera, trigger "Kill Animation" on UI, start Cooldown timer.
3.	Error: If they scan a fellow Imposter, show warning: FRIENDLY FIRE! Cannot kill ally.
D. Fake Task List (Body)
Looks exactly like the Crewmate task list.
Clicking them allows PIN entry (just like Crew), but completion adds 0% to the Global Progress Bar. This allows Imposters to "fake" verifying with Execs.

5. Ghost Game Dashboard (Dead)
User: Crewmates who were killed or ejected.
State: Active Gameplay.
•	Theme: Grey colors.
•	Header: YOU ARE A GHOST (Go to Home Base).
•	Task List:
o	Shows Main Tasks ONLY. (Filler tasks are hidden as they don't count for Ghosts).
o	Verification: Works same as Crewmate (requires Exec PIN).
o	Progress: Completing these adds to the Global Progress Bar (but at a lower weighted value).
•	Restrictions: NO Voting access. NO Kill button.

6. Meeting & Voting UI
For all Alive Players (Crew & Imposters).
Trigger: Automatically replaces Dashboard when Admin triggers "Start Voting."
A. Header
•	“EMERGENCY MEETING”
•	Timer: Voting Ends in: 60s, voting poll opens after 40 seconds. 
B. Voting layout
A grid of buttons representing every Alive player (P01, P02, etc.), and a search bar to filter players.
Dead players won’t show up. Player's own ID is highlighted.
	Tap "P05" → Confirmation Popup: "Vote to eject P05?" → Confirm / Cancel.
	Skip Button: A distinct button at the bottom: "SKIP VOTE".
C. Waiting State (Post voting)
Once a player casts their vote, the grid disappears.
•	Text: "Vote Cast. Waiting for others..."


7. Admin Dashboard (Host Control Center)
For The Host (Laptop/ipad View).
State: Always Active.
A. Game Controls (Top Bar)
•	Start Game: Locks lobby, assigns roles, starts timer.
•	Pause/Meeting: Red Button. TRIGGER MEETING. Pause timer, lock player screens.
•	Open Voting: "START VOTE NOW". Voting UI to all phones.
•	End Round: “FINISH GAME.” Shows Victory Screen.  If bar is full then admin should press “finish game” button, or if imposters are more than crew or other conditions. Admin manually starts and ends.
B. Live Feed (Main Area)
•	Global Progress: Huge bar showing Crewmate completion %.
•	Player List Table:
o	Columns: ID (P01), Role(imposter or crew), Status (Alive/Dead), Kills (if Imposter), Tasks completed.
o	Note: Host needs to see who is dead to manually trigger the "5 Deaths" meeting.
C. Reset Controls (Bottom Settings)
•	Reset Round: "RESET ALL DATA".
o	Action: Wipes all progress, revives all players, disconnects current sessions.
o	For when the first group leaves and the second group of 30 walks in.





Summary:
1.	Registration: Admin creates P01–P30 in DB with "Crew" or "Imposter" flags.
2.	Round 1: Players login. Game Start.
3.	Flow:
	Crew: Click Task -> Enter PIN -> Progress Bar Up.
	Imposter: Click Kill -> Scan QR -> P(x) status = Dead -> Cooldown Start.
4.	Meeting:
	Host sees 5 dead (or buzzer pressed).
	Host clicks "Trigger Meeting" -> All Phones freeze.
	Host clicks "Open Voting" -> All Phones show Grid.
	Host announces results -> Host clicks "Resume Game" (or Eject Player).
5.	Round End: Host clicks "Reset Round" -> Database clears for next group.












