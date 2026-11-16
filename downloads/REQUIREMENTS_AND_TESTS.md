# Transport Monitor: Requirements and Tests

<!-- Keep every heading in this file exactly as it is. The lecturer's tools find your
     work by these headings. Replace the text in angle brackets. Delete these comments
     if you like. -->

## Student details

- Name: <your name>
- Student number: <your number>
- Build ID: <must match build_id in your firmware's ready and hello messages>
- Submission: <First or Final>
- Date: <date>

## Feature list

<!-- List the core features and every feature you choose. Status is Planned in the
     first submission. In the final submission use Implemented, Partly implemented
     or Dropped. Claimed means you want the feature tested and marked. Claim only
     features your own tests show working: a claimed feature that fails its main
     test counts against you. -->

| ID | Feature | Status | Claimed |
|---|---|---|---|
| C01 | Start both sensors and report the health of each one separately | Planned | Yes |
| C02 | Read temperature and humidity from the AHT20 | Planned | Yes |
| ... | ... | ... | ... |

## Build and setup

- Toolchain and version: <for example Arduino IDE 2.3.4, esp32 board package 3.1.0>
- Libraries and versions: <name and version of each library>
- Board settings: <the board menu settings you build with>
- How to build: <steps>
- How to flash the binary: <steps>
- Accelerometer range: <±4, ±8 or ±16 g>
- IMU sample rate: <Hz>
- AHT20 read interval: <ms>

## Button map

<!-- Which button press gives each action in the test protocol, section 7. -->

| Action | Button press |
|---|---|
| screen_next | <for example short press D2> |
| ... | ... |

## Extra state fields and event kinds

<!-- Any field you add to the state reply, with its type and unit, and every event
     kind your event list uses. Write "None" if there are none. -->

## Features

<!-- One section per feature, in the order of your feature list. Each section has
     the same four headings. The example below uses an invented feature, EX1, that
     is not in the project, so that you can see the layout. -->

### EX1: Humidity hysteresis

<!-- Invented example. Delete this section in your own file. -->

#### Requirements

- EX1-R1: The humidity alarm HUMID_HIGH starts when relative humidity is greater than humidity_max_pct.
- EX1-R2: Once HUMID_HIGH is active, it clears only when relative humidity is less than or equal to humidity_clear_pct.
- EX1-R3: humidity_clear_pct has a default of 65%, a step of 1%, and must be at least 1 percentage point below humidity_max_pct. A value that breaks this rule is rejected with bad_value and the old value stays.
- EX1-R4: If the humidity reading becomes invalid or stale while HUMID_HIGH is active, HUMID_HIGH leaves causes and the humidity fault is reported. When a valid reading returns, the alarm starts again only if the reading is greater than humidity_max_pct.
- EX1-R5: The user sets humidity_clear_pct in the menu under Limits > Humidity clear, or over serial with settings.set.

#### Tests

| Test | Covers | How | Setup | Expected result | Result |
|---|---|---|---|---|---|
| EX1-T1 | R1, R2 | Serial: tests/EX1.jsonl | Defaults, humidity_clear_pct 65 | Alarm starts at 71%, stays at 66%, clears at 65% | |
| EX1-T2 | R3 | Serial: tests/EX1.jsonl | Defaults | With humidity_max_pct at 70, 70 is rejected with bad_value and 69 is accepted | |
| EX1-T3 | R4 | Serial: tests/EX1.jsonl | Alarm active at 71% | Invalid humidity removes HUMID_HIGH; valid 68% does not restart it | |
| EX1-T4 | R5 | By hand | Monitor on home screen | Menu path reaches Humidity clear and the value changes in steps of 1% | |

<!-- How is "Serial: <file>" for a test in a test file, or "By hand" for a button,
     screen or physical test. Result is empty in the first submission. In the final
     submission write Pass or Fail and the name of your log file. -->

#### By-hand steps

<!-- Numbered steps for every test marked By hand. Someone else will follow these
     on identical hardware without you there, so start from a state they can reach. -->

EX1-T4:
1. Power the board and wait for the home screen.
2. Long press D1 to open the menu.
3. Press D2 until "Humidity clear" is shown, then short press D1.
4. Press D2 once. Expected: the value on screen changes from 65 to 66.
5. Short press D0 to cancel. Expected: state.get still shows humidity_clear_pct 65.

#### Changes since first submission

<!-- Final submission only. What changed in this feature's requirements or tests,
     and why. Write "None" if nothing changed. -->

## Known limitations

<!-- Anything that does not work as the requirements say, or that you could not test. -->
