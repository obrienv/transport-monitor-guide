const features = [
  {
    "id": "C01",
    "label": "C01",
    "title": "Start both sensors and report the health of each one separately",
    "group": "Core"
  },
  {
    "id": "C02",
    "label": "C02",
    "title": "Read temperature and humidity from the AHT20",
    "group": "Core"
  },
  {
    "id": "C03",
    "label": "C03",
    "title": "Read acceleration and angular rate from the ICM-20948",
    "group": "Core"
  },
  {
    "id": "C04",
    "label": "C04",
    "title": "Decide whether temperature and humidity are inside their limits",
    "group": "Core"
  },
  {
    "id": "C05",
    "label": "C05",
    "title": "Show the current acceleration alarm on the TFT and USB serial when total magnitude (including gravity) exceeds the limit. Clear it on a valid reading at or below the limit",
    "group": "Core"
  },
  {
    "id": "C06",
    "label": "C06",
    "title": "Measure static tilt against the fixed upright reference",
    "group": "Core"
  },
  {
    "id": "C07",
    "label": "C07",
    "title": "Keep each alarm cause separate and show it on the screen",
    "group": "Core"
  },
  {
    "id": "C08",
    "label": "C08",
    "title": "Report a missing sensor or a failed measurement as a fault",
    "group": "Core"
  },
  {
    "id": "C09",
    "label": "C09",
    "title": "Show live measurements on the TFT screen, with a Home screen that shows the monitoring status, the alarm and fault status, and the health of each sensor",
    "group": "Core"
  },
  {
    "id": "C10",
    "label": "C10",
    "title": "Navigate the screens with buttons D0, D1 and D2. Holding D0 for 2 seconds or longer returns to Home from any screen",
    "group": "Core"
  },
  {
    "id": "C12",
    "label": "C12",
    "title": "Print readable live measurements, alarm and fault status, and sensor health on the USB serial port",
    "group": "Core"
  },
  {
    "id": "C13",
    "label": "C13",
    "title": "Provide a menu to edit the five limits, with validation of every value, confirm, cancel and restore defaults",
    "group": "Core"
  },
  {
    "id": "P08",
    "label": "P08",
    "title": "Tilt hysteresis: the tilt alarm clears at a lower angle than the angle that starts it. You choose both angles",
    "group": "Alarms",
    "description": "The Part 2A tilt alarm starts and clears at the same angle, so a unit sitting close to the limit can switch the alarm on and off again and again. With hysteresis the alarm starts at one angle and clears only when the tilt falls below a second, lower angle. You choose both angles."
  },
  {
    "id": "P10",
    "label": "P10",
    "title": "Latched alarm: an alarm stays shown until the user acknowledges it. Acknowledging does not clear a condition that is still present",
    "group": "Alarms",
    "description": "The Part 1 and Part 2A alarms clear by themselves when the condition goes away, so an alarm that happened during the journey can be gone by the time anyone looks. A latched alarm stays shown after its condition has gone, until the user acknowledges it. Acknowledging an alarm whose condition is still present does not clear it."
  },
  {
    "id": "P05",
    "label": "P05",
    "title": "Arm and disarm: disarming suppresses alarms while fault reporting continues, and re-arming resumes the limit checks",
    "group": "Alarms",
    "description": "Disarming stops the monitor raising alarms, for example while the unit is being loaded. Sensor faults are still reported while the monitor is disarmed, because a fault means the monitor cannot measure. Re-arming starts the limit checks again."
  },
  {
    "id": "P09",
    "label": "P09",
    "title": "Alarm persistence: an alarm starts only after the condition has lasted a set time. The basic acceleration alarm remains immediate",
    "group": "Alarms",
    "description": "Without persistence, an alarm starts on the first reading past its limit, so one noisy reading can raise it. With persistence, the condition must last for a set time before the alarm starts. The basic acceleration alarm from Part 1 stays immediate. Which other alarms may use persistence will be confirmed before you start Part 2."
  },
  {
    "id": "P01",
    "label": "P01",
    "title": "Two named cargo profiles, each with its own limits, with the active profile shown on Home",
    "group": "Configuration",
    "description": "Part 2A gives the monitor one set of editable limits. A cargo profile is a named set of the five limits for one kind of cargo. With two profiles, the user switches the whole set at once instead of editing each limit, and Home shows which profile is active."
  },
  {
    "id": "P04",
    "label": "P04",
    "title": "Persistent configuration: settings survive power-off. You decide and document which settings persist",
    "group": "Configuration",
    "description": "Without this feature, settings go back to their defaults when the board loses power. With it, settings the user changed are still in force after power-off and restart. You decide and document which settings persist. This feature covers settings only. Keeping stored events across a restart is L02."
  },
  {
    "id": "P06",
    "label": "P06",
    "title": "Orientation policies, such as either-side-up",
    "group": "Configuration",
    "description": "The Part 2A tilt alarm measures tilt from one upright direction. Some equipment may travel in more than one orientation, for example either side up. An orientation policy tells the monitor which orientations count as correct. You define the policies."
  },
  {
    "id": "P02",
    "label": "P02",
    "title": "Edit a setting from each of two different optional features. Each edit must affect that feature's behaviour.",
    "group": "Configuration",
    "settingsSources": 2,
    "description": "Part 2A already lets the user edit the five alarm limits, so editing them again earns nothing extra. P02 extends the menu to settings that belong to two of your other optional features, for example the hysteresis angles of P08. Each edited setting must change how its feature behaves."
  },
  {
    "id": "P07",
    "label": "P07",
    "title": "Upright reference calibration for a unit that travels in another orientation. You design the procedure and how it is checked",
    "group": "Configuration",
    "description": "Part 2A measures tilt against a fixed upright reference, with the breakout flat and its components facing up. Some equipment travels in another orientation. Calibration lets the user make the current orientation the new upright reference, and tilt is then measured from it. You design the procedure and how the user can check it worked."
  },
  {
    "id": "L01",
    "label": "L01",
    "title": "Timestamped event list with CSV export through a documented user action or the serial output. Time since start is acceptable as the timestamp.",
    "group": "Logging",
    "description": "The live serial output from Part 1 shows what is happening now. The event log records what happened: each entry is an event, such as an alarm starting or clearing, with the time it happened. The user can export the list as CSV through a documented action or over serial. Time since start-up is acceptable as the timestamp. The other logging features build on this one."
  },
  {
    "id": "L05",
    "label": "L05",
    "title": "Shipment summary: peaks, minima, maxima and event counts for the whole session, including events no longer kept in the log",
    "group": "Logging",
    "needs": "L01",
    "description": "The shipment summary describes the whole session in a few figures: the peaks, the minimum and maximum readings, and the event counts. The counts include events that are no longer in the log, so the summary stays correct if old events have been discarded."
  },
  {
    "id": "L04",
    "label": "L04",
    "title": "Bounded event storage: keep the newest N events and report how many older events were discarded",
    "group": "Logging",
    "needs": "L01",
    "description": "The event log holds a fixed number of events, N, which you choose. When the log is full, each new event replaces the oldest one, and the monitor counts how many events it has discarded."
  },
  {
    "id": "M04",
    "label": "M04",
    "title": "Record the peak acceleration and time above the limit for each exceedance episode.",
    "group": "Logging",
    "needs": "L01",
    "description": "The Part 1 acceleration alarm only says whether the limit is exceeded now. Peak capture records, for each exceedance episode, the highest acceleration and how long the acceleration stayed above the limit. X2 goes further and records the waveform around a shock. The exact definition of an episode will be confirmed before you start Part 2."
  },
  {
    "id": "L02",
    "label": "L02",
    "title": "Persistent event storage: at least 20 events and their original timestamps survive power-off and restart",
    "group": "Logging",
    "needs": "L01",
    "description": "Without this feature the event log is lost when the board loses power. With it, at least 20 events and their original timestamps are still there after power-off and restart. Keeping settings across a restart is P04, a separate feature."
  },
  {
    "id": "L06",
    "label": "L06",
    "title": "Wall-clock time for event timestamps, set by a method you choose, with time-not-set shown whenever no valid time is available",
    "group": "Logging",
    "needs": "L01",
    "description": "Time since start-up says how long after power-on an event happened, but not the date or time of day. Wall-clock time gives each event a real date and time. You choose how the time is set. Until a valid time is available, the monitor shows that the time is not set."
  },
  {
    "id": "M02",
    "label": "M02",
    "title": "Apply a low-pass filter to acceleration. State the filter method and cutoff.",
    "group": "Signal processing and robustness",
    "description": "Raw accelerometer readings contain noise and vibration. A low-pass filter smooths the readings by reducing fast changes. You choose the filter method and its cutoff frequency, and state both."
  },
  {
    "id": "M01",
    "label": "M01",
    "title": "Accelerometer zero and scale calibration",
    "group": "Signal processing and robustness",
    "description": "Each accelerometer has small offset and scale errors, so at rest it does not read exactly 1 g on the vertical axis and 0 g on the other two. Calibration measures these errors and corrects the readings. You design the procedure."
  },
  {
    "id": "M03",
    "label": "M03",
    "title": "Estimate acceleration with gravity removed.",
    "group": "Signal processing and robustness",
    "needs": "M02",
    "description": "The accelerometer measures gravity and motion together. Removing gravity leaves the acceleration caused by movement, such as a van braking. This feature needs the low-pass filter (M02), which can be used to estimate the gravity part."
  },
  {
    "id": "R01",
    "label": "R01",
    "title": "Report a sensor fault after disconnect and automatically restore valid readings after reconnect, without restarting the ESP32.",
    "group": "Signal processing and robustness",
    "description": "When a sensor is unplugged while the monitor runs, the monitor reports a fault for that sensor. When the sensor is plugged back in, the monitor restarts it by itself and valid readings return, without a reset of the ESP32. Part 1 only asks the monitor to detect the fault."
  },
  {
    "id": "R05",
    "label": "R05",
    "title": "Wireless status delivery over the local network",
    "group": "Signal processing and robustness",
    "description": "USB serial needs a cable to a PC. Wireless reporting sends the monitor's status over the local network, so it can be watched without a cable. You choose the method, for example a web page served by the ESP32 or messages sent to a PC."
  },
  {
    "id": "X1",
    "summary": "Switch between lower and higher IMU sample rates as activity changes while monitoring continues.",
    "label": "X1",
    "title": "High-rate and adaptive sampling",
    "group": "Challenges",
    "body": "<p>Acquire IMU data at a high rate while keeping monitoring, the screen and buttons responsive. Choose and justify your target rate and measure whether the device misses samples. Show the current sample rate and the number of lost samples on the TFT and in the USB serial output. Options include the sensor's built-in FIFO and FreeRTOS tasks.</p>\n<p>The sampling is also adaptive: the monitor runs at a lower rate when nothing is happening, raises the rate when it detects a disturbance, and lowers it again once things are quiet.</p>\n<p>The sustained high rate and the adaptive switching are tested separately, because they prove different things.</p>",
    "baseline": "Fixed-rate polling in the main loop.",
    "metrics": "Sustained acquisition rate, lost samples, rate-switch latency and UI responsiveness.",
    "replay": "The decision to switch rate, using quiet and moving sample sequences.",
    "physical": "Measure the sustained sample rate and lost samples during a test of stated duration on the board. Check that the screen and buttons respond during acquisition."
  },
  {
    "id": "X2",
    "summary": "Capture acceleration before and after a shock. Display the waveform and peak on the TFT and support export.",
    "label": "X2",
    "title": "Shock recording with pre-trigger",
    "group": "Challenges",
    "body": "<p>When a knock exceeds the acceleration limit, the monitor saves the raw samples from before and after the knock, so that the shape of the shock can be examined later. To have the samples from before the knock, the monitor must keep a rolling buffer of recent samples at all times.</p>\n<p>Monitoring and alarms must keep running while a recording is saved and while it is exported. On the TFT, show the captured waveform and its peak magnitude. Peak capture (M04) measures the peak and duration of an exceedance episode. X2 captures the samples on either side of the trigger for review and export.</p>",
    "baseline": "Recording only from the trigger onwards.",
    "metrics": "Pre- and post-trigger duration, sampling rate, missed samples, retention and export time.",
    "replay": "The trigger point, the samples kept before and after it, their timestamps, and several shocks in a row.",
    "physical": "Capture multiple real shocks, review their waveforms and peaks on the TFT, and export a recording while measuring whether acquisition and monitoring continue."
  },
  {
    "id": "X3",
    "summary": "Compute an FFT and display its magnitude spectrum and dominant peaks on the TFT.",
    "label": "X3",
    "title": "FFT vibration analysis",
    "group": "Challenges",
    "body": "<p>Compute an FFT (fast Fourier transform) on a window of accelerometer samples. Plot the magnitude spectrum on the TFT with a labelled frequency scale and show the dominant peak or peaks. Choose and justify the sample rate, window length and windowing method.</p>\n<p>A clean sine wave is too easy a test. Justify your sample rate, window length and frequency resolution, and test with noise and with two frequencies present.</p>",
    "baseline": "Counting zero crossings.",
    "metrics": "Frequency and magnitude error, resolution, leakage, noise sensitivity and update rate.",
    "replay": "Accuracy on known sine waves, with noise added and with two frequencies present.",
    "physical": "Show a TFT spectrum from real vibration and compare its peaks with an offline analysis of the same samples."
  },
  {
    "id": "X4",
    "summary": "Combine accelerometer and gyroscope data to estimate tilt during motion.",
    "label": "X4",
    "title": "Fused tilt during motion",
    "group": "Challenges",
    "body": "<p>The core measures tilt from the accelerometer alone, using the direction of gravity. That works while the unit is still. When the unit moves, for example when a van brakes, the accelerometer measures gravity plus the motion, so the tilt reading jumps even though the box has not rotated.</p>\n<p>The gyroscope measures how fast the unit rotates and is not affected by that motion. Adding up its readings gives the change in angle, but small errors build up, so the angle slowly drifts. A fused estimate combines the two sensors: it follows the gyroscope over short times and lets the accelerometer correct the drift over long times. Common methods are a complementary filter and a Kalman filter.</p>",
    "baseline": "The accelerometer-only tilt from the core.",
    "metrics": "Angle error against a credible reference during motion, stationary drift and response time.",
    "replay": "Tilt error against the known angle in sequences of rotation and motion.",
    "physical": "Drift at rest, and behaviour during controlled motion on the board."
  },
  {
    "id": "X5",
    "summary": "Change the filter behaviour as the input signal changes.",
    "label": "X5",
    "title": "Adaptive filtering",
    "group": "Challenges",
    "body": "<p>A fixed low-pass filter, like the one in M02, has to trade two things against each other. Heavy filtering gives a smooth reading at rest but reacts slowly to a real change. Light filtering reacts quickly but leaves noise. An adaptive filter changes its behaviour with the signal: it filters heavily when the signal is steady and lightly when something is happening. You choose the method, for example a cutoff that changes with the measured signal variance, an LMS (least mean squares) filter, or a simple Kalman filter.</p>\n<p>The comparison is only fair if your fixed filter is tuned sensibly. A deliberately poor baseline makes the claim worthless.</p>",
    "baseline": "A fixed low-pass filter, tuned fairly.",
    "metrics": "Stationary noise, step response, latency and stability against the tuned fixed filter.",
    "replay": "The same noisy steps fed to your adaptive filter and to your fixed filter, comparing the noise left at rest and the step response.",
    "physical": "One real recording processed by both filters."
  },
  {
    "id": "X6",
    "summary": "Classify handling states on the device using a trained model.",
    "label": "X6",
    "title": "TinyML handling classifier",
    "group": "Challenges",
    "body": "<p>A small trained model running on the board classifies how the unit is being handled, with at least three handling classes that you choose and define, for example at rest, knocked and sustained vibration. You collect your own training data from the board, train the model, convert it to run on the ESP32-S3, and report its RAM use, model size and inference time.</p>\n<p>Test data must come from recording sessions that were not used for training. Data from the same session in both sets makes the accuracy figure meaningless.</p>",
    "baseline": "A hand-written rule, such as thresholds on peak and variance.",
    "metrics": "Per-class accuracy, false positives, inference time, RAM use and model size.",
    "replay": "Classification of labelled recorded traces the model has not seen, with a confusion matrix.",
    "physical": "Classification of real handling on the board, and how long each result takes."
  }
];

// The remaining Core entries are compulsory additions in Part 2.
const partOneIDs = new Set(["C01","C02","C03","C04","C05","C07","C08","C09","C12"]);
const partOneTitles = {
  C03: "Read three-axis acceleration from the ICM-20948",
  C05: "Indicate an acceleration alarm on the TFT and USB serial above 1.5 g total magnitude, including gravity. Clear it at or below 1.5 g on a valid reading",
  C09: "Show live measurements with units, distinct alarms, individual sensor health, faults and unavailable values on a readable TFT interface of your choice"
};
