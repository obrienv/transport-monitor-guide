# Transport Monitor: Requirements and Tests

<!-- Keep every heading in this file exactly as it is. The lecturer's tools find your
     work by these headings. Replace the text in angle brackets. Delete these comments
     if you like. You can also write this document in the project workbook on the
     guide site. The workbook produces a file with the same layout. Submit this
     Markdown file with your source code and one full merged firmware image
     (*.ino.merged.bin) for the same build. -->

## Student details

- Name: <your name>
- Student number: <your number>
- Build ID: <must match the build ID your firmware prints on serial at start-up>
- Submission: <Part 1 or Part 2>

## Feature list

<!-- In Part 1, list the compulsory basic-monitor features. In Part 2, list
     the compulsory and chosen features. Record status as Planned, Implemented,
     Partly implemented or Dropped. Leave Claimed empty in Part 1. In Part 2
     enter Yes or No. Claim only features your tests show working. -->

| ID | Feature | Status | Claimed |
|---|---|---|---|
| C01 | Start both sensors and report the health of each one separately | Planned | |
| C02 | Read temperature and humidity from the AHT20 | Planned | |
| ... | ... | ... | ... |

## Optional setup instructions

<!-- Include steps or settings specific to your submission that the lecturer
     needs before running tests. Leave blank if the standard lab setup works. -->

## Features

<!-- In both parts, give requirements, tests and results for every feature.
     Show how to observe each Part 1 feature. In Part 2, record the route from
     Home where applicable and repeat relevant Part 1 tests on the final build.
     EX1 below is an invented example. -->

### EX1: Humidity hysteresis

<!-- Invented example. Delete this section in your own file. -->

#### Requirements

- EX1-R1: The humidity alarm HUMID_HIGH starts when relative humidity is greater than humidity_max_pct.
- EX1-R2: Once HUMID_HIGH is active, it clears only when relative humidity is less than or equal to humidity_clear_pct.
- EX1-R3: humidity_clear_pct has a default of 65%, a step of 1%, and must be at least 1 percentage point below humidity_max_pct. The menu refuses a value that breaks this rule, shows why, and keeps the old value.
- EX1-R4: If humidity is unavailable at startup, report the humidity sensor fault and mark the humidity reading unavailable. Keep the humidity alarm inactive until a valid reading permits evaluation.
- EX1-R5: The user sets humidity_clear_pct from Home under Settings > Limits > Humidity clear.

#### Tests

<!-- Both parts. Record the steps, expected result and actual observation.
     Give enough detail for the lecturer to repeat the test on your binary. -->

| Test | Covers | Method | Starting state | Expected result | Result | Actions or inputs | Actual observation |
|---|---|---|---|---|---|---|---|
| EX1-T1 | EX1-R1, EX1-R2 | Physical: breathe on the AHT20, reference hygrometer beside it | Defaults, humidity_clear_pct 65, room humidity below 60% | Alarm starts once RH passes 70%, stays on while RH falls through 66%, clears at or below 65% | Pass | Breathe on the sensor until RH passes 70%, then let it dry in still air | Alarm on at 70.6%, still on at 66.1%, off at 64.8% |
| EX1-T2 | EX1-R3, EX1-R5 | Buttons and screen | Defaults, on Home | The setting is accessible from Home; 70 is refused and 65 stays; 69 is accepted | Pass | Follow EX1-T2 below | Reached the setting from Home; 70 was refused, and 69 was saved |
| EX1-T3 | EX1-R4 | Physical: AHT20 cable unplugged before power-up | Board off | After power-up, the AHT20 fault is shown, humidity is unavailable, and the humidity alarm is inactive | Pass | Power off, unplug the AHT20 cable, power on | AHT20 FAULT on Home, humidity unavailable, no HUMID_HIGH |

#### Test procedures

<!-- Optional space for a longer procedure. Refer to its test ID. -->

EX1-T2:
1. Power the board and wait for Home.
2. Short press D1 to open Settings. Press D2 until "Limits" is shown, then short press D1.
3. Press D2 until "Humidity clear" is shown, then short press D1 to edit.
4. Press D2 until 70 is shown and short press D1. Expected: "Must be below max (70)" and the value returns to 65.
5. Press D2 until 69 is shown and short press D1. Expected: the value 69 is kept.
6. Hold D0 for 2 seconds. Expected: Home is shown.

#### Feature access

<!-- For Part 1, explain how to observe the feature. In Part 2, give the button presses from
     Home, what the screen shows, how to operate the feature and how to get back
     to Home, with the navigation test you ran on the final binary. -->

Home > short press D1 (Settings) > D2 to Limits, short press D1 > D2 to Humidity clear, short press D1 to edit. While editing, D2 raises the value, D0 lowers it, a short press of D1 confirms and a long press of D1 cancels and keeps the old value. Holding D0 for 2 seconds returns to Home from any screen. Navigation test run on build tm-2026-1.4: route followed three times, and Home reached each time with D0 held for 2 seconds.

#### Implementation notes

<!-- Optional. Design decisions, problems and fixes that a tester should know. -->
