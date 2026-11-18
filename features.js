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
    "title": "Detect any acceleration sample whose magnitude exceeds the limit",
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
    "group": "Alarms"
  },
  {
    "id": "P10",
    "label": "P10",
    "title": "Latched alarm: an alarm stays shown until the user acknowledges it. Acknowledging does not clear a condition that is still present",
    "group": "Alarms"
  },
  {
    "id": "P05",
    "label": "P05",
    "title": "Arm and disarm: disarming suppresses alarms while fault reporting continues, and re-arming resumes the limit checks",
    "group": "Alarms"
  },
  {
    "id": "P09",
    "label": "P09",
    "title": "Alarm persistence: an alarm starts only after the condition has lasted a set time. This applies to sustained conditions, not to single knocks",
    "group": "Alarms"
  },
  {
    "id": "P01",
    "label": "P01",
    "title": "Two named cargo profiles, each with its own limits, with the active profile shown on Home",
    "group": "Configuration"
  },
  {
    "id": "P04",
    "label": "P04",
    "title": "Persistent configuration: settings survive power-off. You decide and document which settings persist",
    "group": "Configuration"
  },
  {
    "id": "P06",
    "label": "P06",
    "title": "Orientation policies, such as either-side-up",
    "group": "Configuration"
  },
  {
    "id": "P02",
    "label": "P02",
    "title": "Menu editing of at least two settings that belong to two different optional features",
    "group": "Configuration",
    "settingsSources": 2
  },
  {
    "id": "P07",
    "label": "P07",
    "title": "Upright reference calibration for a unit that travels in another orientation. You design the procedure and how it is checked",
    "group": "Configuration"
  },
  {
    "id": "L01",
    "label": "L01 + L03",
    "title": "Timestamped event list with CSV export through a documented user action or the serial output. Time since start is acceptable as the timestamp. The two count as one feature",
    "group": "Logging"
  },
  {
    "id": "L05",
    "label": "L05",
    "title": "Shipment summary: peaks, minima, maxima and event counts for the whole session, including events no longer kept in the log",
    "group": "Logging",
    "needs": "L01"
  },
  {
    "id": "L04",
    "label": "L04",
    "title": "Bounded event storage: keep the newest N events and report how many older events were discarded",
    "group": "Logging",
    "needs": "L01"
  },
  {
    "id": "M04",
    "label": "M04",
    "title": "Peak capture: for each exceedance event, record the peak acceleration magnitude in g and the duration in milliseconds",
    "group": "Logging",
    "needs": "L01"
  },
  {
    "id": "L02",
    "label": "L02",
    "title": "Persistent event storage: at least 20 events and their original timestamps survive power-off and restart",
    "group": "Logging",
    "needs": "L01"
  },
  {
    "id": "L06",
    "label": "L06",
    "title": "Wall-clock time for event timestamps, set by a method you choose, with time-not-set shown whenever no valid time is available",
    "group": "Logging",
    "needs": "L01"
  },
  {
    "id": "M02",
    "label": "M02",
    "title": "Low-pass filtering with a stated method and cutoff, comparing raw and filtered measurements to show the filter's effect",
    "group": "Signal processing and robustness",
    "note": "Plots made offline, serial logs or exported data are acceptable evidence. No on-screen graph is needed."
  },
  {
    "id": "M01",
    "label": "M01",
    "title": "Accelerometer zero and scale calibration",
    "group": "Signal processing and robustness"
  },
  {
    "id": "M03",
    "label": "M03",
    "title": "Dynamic acceleration estimate with gravity removed, shown in several static orientations and during movement",
    "group": "Signal processing and robustness",
    "needs": "M02",
    "note": "Plots made offline, serial logs or exported data are acceptable evidence. No on-screen graph is needed."
  },
  {
    "id": "R01",
    "label": "R01",
    "title": "Sensor reconnect: the monitor recovers when a sensor cable is unplugged and plugged back in",
    "group": "Signal processing and robustness",
    "note": "Provisional. Kept only if a safe reconnect test is confirmed in the lab."
  },
  {
    "id": "R05",
    "label": "R05",
    "title": "Wireless status delivery over the local network",
    "group": "Signal processing and robustness"
  },
  {
    "id": "X1",
    "label": "X1",
    "title": "High-rate and adaptive sampling",
    "group": "Challenges",
    "body": "<p>The core needs the IMU sampled at 50 Hz or more. This challenge raises that to several hundred hertz, with no samples lost while the screen updates and the menus are used. A simple main loop cannot do this, because a screen redraw blocks it for tens of milliseconds. You need either the ICM-20948's built-in FIFO (a buffer on the sensor chip that stores samples until you read them in a burst) or FreeRTOS tasks, or both.</p>\n<p>The sampling is also adaptive: the monitor runs at a lower rate when nothing is happening, raises the rate when it detects a disturbance, and lowers it again once things are quiet.</p>\n<p>The sustained high rate and the adaptive switching are tested separately, because they prove different things.</p>",
    "baseline": "Fixed-rate polling in the main loop.",
    "target": "400 Hz real IMU sampling for 10 minutes with the screen active and lost samples counted; the high rate starts within 50 ms of activity.",
    "replay": "The decision to switch rate, using quiet and moving sample sequences.",
    "physical": "The real sample rate held for 10 minutes, a count of lost samples, and the screen and buttons still responding. Replayed samples cannot prove the real rate, because their timestamps are supplied."
  },
  {
    "id": "X2",
    "label": "X2",
    "title": "Shock recording with pre-trigger",
    "group": "Challenges",
    "body": "<p>When a knock exceeds the acceleration limit, the monitor saves the raw samples from before and after the knock, so that the shape of the shock can be examined later. To have the samples from before the knock, the monitor must keep a rolling buffer of recent samples at all times.</p>\n<p>Monitoring and alarms must keep running while a recording is saved and while it is exported. Peak capture (M04) records only the peak and duration of a knock; this challenge keeps the whole waveform, which makes it a memory and timing problem.</p>",
    "baseline": "Recording only from the trigger onwards.",
    "target": "At least 200 ms before and after the trigger at 200 Hz or more; the last five recordings kept; one exported in under 2 seconds; several shocks tested.",
    "replay": "The trigger point, the samples kept before and after it, their timestamps, and several shocks in a row.",
    "physical": "Real knocks captured, a recording exported while monitoring continues, and evidence that no samples were lost."
  },
  {
    "id": "X3",
    "label": "X3",
    "title": "Vibration analysis",
    "group": "Challenges",
    "body": "<p>The monitor reports the main frequency of vibration and its size, worked out over a window of recent accelerometer samples. You choose the method, for example an FFT (fast Fourier transform) or the Goertzel algorithm, and the window length. The sample rate limits the highest frequency you can measure: at 50 Hz sampling you cannot measure anything above 25 Hz.</p>\n<p>A clean sine wave is too easy a test. Justify your sample rate, window length and frequency resolution, and test with noise and with two frequencies present.</p>",
    "baseline": "Counting zero crossings.",
    "target": "1 to 20 Hz, within 0.5 Hz on the replay data, with the result refreshed every second once the window is full.",
    "replay": "Accuracy on known sine waves, with noise added and with two frequencies present.",
    "physical": "Frequency estimates from real vibration, checked against your own offline analysis of the same samples."
  },
  {
    "id": "X4",
    "label": "X4",
    "title": "Fused tilt during motion",
    "group": "Challenges",
    "body": "<p>The core measures tilt from the accelerometer alone, using the direction of gravity. That works while the unit is still. When the unit moves, for example when a van brakes, the accelerometer measures gravity plus the motion, so the tilt reading jumps even though the box has not rotated.</p>\n<p>The gyroscope measures how fast the unit rotates and is not affected by that motion. Adding up its readings gives the change in angle, but small errors build up, so the angle slowly drifts. A fused estimate combines the two sensors: it follows the gyroscope over short times and lets the accelerometer correct the drift over long times. Common methods are a complementary filter and a Kalman filter.</p>",
    "baseline": "The accelerometer-only tilt from the core.",
    "target": "Under 2° error on the motion replay, and under 1° per minute drift at rest.",
    "replay": "Tilt error against the known angle in sequences of rotation and motion.",
    "physical": "Drift at rest, and behaviour during controlled motion on the board."
  },
  {
    "id": "X5",
    "label": "X5",
    "title": "Adaptive filtering",
    "group": "Challenges",
    "body": "<p>A fixed low-pass filter, like the one in M02, has to trade two things against each other. Heavy filtering gives a smooth reading at rest but reacts slowly to a real change. Light filtering reacts quickly but leaves noise. An adaptive filter changes its behaviour with the signal: it filters heavily when the signal is steady and lightly when something is happening. You choose the method, for example a cutoff that changes with the measured signal variance, an LMS (least mean squares) filter, or a simple Kalman filter.</p>\n<p>The comparison is only fair if your fixed filter is tuned sensibly. A deliberately poor baseline makes the claim worthless.</p>",
    "baseline": "A fixed low-pass filter, tuned fairly.",
    "target": "Noise at rest (standard deviation) at least 50% lower than a fair fixed filter, with a step response no slower.",
    "replay": "The same noisy steps fed to your adaptive filter and to your fixed filter, comparing the noise left at rest and the step response.",
    "physical": "One real recording processed by both filters."
  },
  {
    "id": "X6",
    "label": "X6",
    "title": "TinyML handling classifier",
    "group": "Challenges",
    "body": "<p>A small trained model running on the board classifies how the unit is being handled, with at least three classes: at rest, knocked and sustained vibration. You collect your own training data from the board, train the model, convert it to run on the ESP32-S3, and report its RAM use, model size and inference time.</p>\n<p>Test data must come from recording sessions that were not used for training. Data from the same session in both sets makes the accuracy figure meaningless.</p>",
    "baseline": "A hand-written rule, such as thresholds on peak and variance.",
    "target": "At least 90% correct overall and 80% for each class, with a result every 500 ms or less.",
    "replay": "Classification of labelled recorded traces the model has not seen, with a confusion matrix.",
    "physical": "Classification of real handling on the board, and how long each result takes."
  }
];
