# Transport Monitor: Requirements and Tests

<!-- Keep every heading in this file exactly as it is. The lecturer's tools find your
     work by these headings. Replace the text in angle brackets. Delete these comments
     if you like. You can also write this document in the project workbook on the
     guide site. The workbook produces a file with the same layout. -->

## Student details

- Name: <your name>
- Student number: <your number>
- Build ID: <must match the build ID your firmware prints on serial at start-up>
- Submission: <First or Final>
- Date: <date>

## Feature list

<!-- List the core features and every feature you choose. Status is Planned in the
     first submission. In the final submission use Implemented, Partly implemented
     or Dropped. Leave Claimed empty in the first submission. In the final submission
     write Yes or No. Claimed means you want the feature marked. Claim only features
     your own tests show working. -->

| ID | Feature | Status | Claimed |
|---|---|---|---|
| C01 | Start both sensors and report the health of each one separately | Planned | |
| C02 | Read temperature and humidity from the AHT20 | Planned | |
| ... | ... | ... | ... |

## Plan

<!-- A few sentences: why you chose these features and the order you will build them in. -->

## Build and setup

- Toolchain and version: <for example Arduino IDE 2.3.4, esp32 board package 3.1.0>
- Libraries and versions: <name and version of each library>
- Board settings: <the board menu settings you build with>
- How to build: <steps>
- How to flash the binary: <steps>
- Accelerometer range: <±4, ±8 or ±16 g>
- IMU sample rate: <Hz>
- AHT20 read interval: <ms>

## Home screen

<!-- What Home shows, and how the user gets from Home to the measurements, the
     settings and your other features. -->

## Button map

<!-- The button press for each action your firmware supports. -->

| Action | Button press |
|---|---|
| Next screen | <for example short press D2> |
| ... | ... |

## Serial output

<!-- The layout of your live serial output (C12), its update rate and an example line. -->

## Features

<!-- One section per feature, in the order of your feature list. The first submission
     needs only Requirements, and Implementation notes if you have any. The other
     headings are for the final submission. The example below uses an invented
     feature, EX1, that is not in the project, so that you can see the layout. -->

### EX1: Humidity hysteresis

<!-- Invented example. Delete this section in your own file. -->

#### Requirements

- EX1-R1: The humidity alarm HUMID_HIGH starts when relative humidity is greater than humidity_max_pct.
- EX1-R2: Once HUMID_HIGH is active, it clears only when relative humidity is less than or equal to humidity_clear_pct.
- EX1-R3: humidity_clear_pct has a default of 65%, a step of 1%, and must be at least 1 percentage point below humidity_max_pct. The menu refuses a value that breaks this rule, shows why, and keeps the old value.
- EX1-R4: If the humidity reading becomes invalid while HUMID_HIGH is active, HUMID_HIGH is no longer shown as an alarm cause and the humidity fault is reported. When a valid reading returns, the alarm starts again only if the reading is greater than humidity_max_pct.
- EX1-R5: The user sets humidity_clear_pct from Home under Settings > Limits > Humidity clear.

#### Tests

<!-- Final submission only. Method says how the test is done, for example Physical,
     Buttons and screen, or Serial log. Result is Pass or Fail. Evidence names your
     log file, photo or measurement record. -->

| Test | Covers | Method | Starting state | Expected result | Result | Actions or inputs | Actual observation | Evidence |
|---|---|---|---|---|---|---|---|---|
| EX1-T1 | EX1-R1, EX1-R2 | Physical: breathe on the AHT20, reference hygrometer beside it | Defaults, humidity_clear_pct 65, room humidity below 60% | Alarm starts once RH passes 70%, stays on while RH falls through 66%, clears at or below 65% | Pass | Breathe on the sensor until RH passes 70%, then let it dry in still air | Alarm on at 70.6%, still on at 66.1%, off at 64.8% | logs/EX1-T1.txt, photo EX1-T1.jpg |
| EX1-T2 | EX1-R3 | Buttons and screen | Defaults, on Home | 70 is refused with a message and 65 stays; 69 is accepted | Pass | Set Humidity clear to 70, then to 69 | As expected | photos EX1-T2a.jpg, EX1-T2b.jpg |
| EX1-T3 | EX1-R4 | Physical: AHT20 cable unplugged before power-up | Board off | After power-up with the AHT20 unplugged, the AHT20 fault is shown and no humidity alarm. This does not test an alarm that is active when the sensor fails, because unplugging a running board is not a safe test | Pass | Power off, unplug the AHT20 cable, power on | AHT20 FAULT on Home, no HUMID_HIGH | logs/EX1-T3.txt |

#### Test procedures

<!-- Final submission only. Numbered steps for each test. Someone else will follow
     these on identical hardware without you there, so start from a state they can reach. -->

EX1-T2:
1. Power the board and wait for Home.
2. Short press D1 to open Settings. Press D2 until "Limits" is shown, then short press D1.
3. Press D2 until "Humidity clear" is shown, then short press D1 to edit.
4. Press D2 until 70 is shown and short press D1. Expected: "Must be below max (70)" and the value returns to 65.
5. Press D2 until 69 is shown and short press D1. Expected: the value 69 is kept.
6. Hold D0 for 2 seconds. Expected: Home is shown.

#### Access from Home

<!-- Final submission only. Your Feature Access Guide entry: the button presses from
     Home, what the screen shows, how to operate the feature and how to get back
     to Home, with the navigation test you ran on the final binary. -->

Home > short press D1 (Settings) > D2 to Limits, short press D1 > D2 to Humidity clear, short press D1 to edit. While editing, D2 raises the value, D0 lowers it, a short press of D1 confirms and a long press of D1 cancels and keeps the old value. Holding D0 for 2 seconds returns to Home from any screen. Navigation test run on build tm-2026-1.4: route followed three times, and Home reached each time with D0 held for 2 seconds.

#### Implementation notes

<!-- Optional. Design decisions, problems and fixes that a tester should know. -->

#### Changes since first submission

<!-- Final submission only. What changed in this feature's requirements or tests,
     and why. Write "None" if nothing changed. -->

## Known limitations

<!-- Anything that does not work as the requirements say, or that you could not test. -->
