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
    "title": "Report invalid or out-of-date sensor data as a fault",
    "group": "Core"
  },
  {
    "id": "C09",
    "label": "C09",
    "title": "Show live measurements on the TFT screen",
    "group": "Core"
  },
  {
    "id": "C10",
    "label": "C10",
    "title": "Navigate the screens with buttons D0, D1 and D2",
    "group": "Core"
  },
  {
    "id": "C11",
    "label": "C11",
    "title": "Accept the common serial test messages and process them with the real monitoring logic",
    "group": "Core"
  },
  {
    "id": "C12",
    "label": "C12",
    "title": "Output the monitoring state in the standard machine-readable format",
    "group": "Core"
  },
  {
    "id": "C13",
    "label": "C13",
    "title": "Provide a menu to edit the five limits, with validation, confirm, cancel and restore defaults",
    "group": "Core"
  },
  {
    "id": "P08",
    "label": "P08",
    "title": "Tilt hysteresis: the tilt alarm clears at a lower angle than the angle that starts it",
    "group": "Alarms",
    "assessment": "Tested"
  },
  {
    "id": "P10",
    "label": "P10",
    "title": "Latched alarm: an alarm stays shown until the user acknowledges it",
    "group": "Alarms",
    "assessment": "Tested"
  },
  {
    "id": "P05",
    "label": "P05",
    "title": "Arm and disarm: disarming suppresses alarms while fault reporting continues",
    "group": "Alarms",
    "assessment": "Tested"
  },
  {
    "id": "P09",
    "label": "P09",
    "title": "Alarm persistence: an alarm starts only after the condition has lasted a set time",
    "group": "Alarms",
    "assessment": "Tested"
  },
  {
    "id": "P01",
    "label": "P01",
    "title": "Two named cargo profiles, each with its own limits",
    "group": "Configuration",
    "assessment": "Tested"
  },
  {
    "id": "P04",
    "label": "P04",
    "title": "Persistent configuration: settings survive power-off",
    "group": "Configuration",
    "assessment": "Tested"
  },
  {
    "id": "P03",
    "label": "P03",
    "title": "Configuration validation beyond the checks in C13",
    "group": "Configuration",
    "assessment": "Tested"
  },
  {
    "id": "P06",
    "label": "P06",
    "title": "Orientation policies, such as either-side-up",
    "group": "Configuration",
    "needs": "P01",
    "assessment": "Tested"
  },
  {
    "id": "P02",
    "label": "P02",
    "title": "Menu editing of at least two settings that belong to your other features",
    "group": "Configuration",
    "settingsSources": 2,
    "assessment": "Tested"
  },
  {
    "id": "P07",
    "label": "P07",
    "title": "Upright reference calibration for a unit that travels in another orientation",
    "group": "Configuration",
    "assessment": "Tested"
  },
  {
    "id": "L01",
    "label": "L01 + L03",
    "title": "Timestamped event list with CSV export. The two count as one feature",
    "group": "Logging",
    "assessment": "Tested"
  },
  {
    "id": "L05",
    "label": "L05",
    "title": "Shipment summary: peaks, minima, maxima and event counts for a session",
    "group": "Logging",
    "needs": "L01",
    "assessment": "Tested"
  },
  {
    "id": "L04",
    "label": "L04",
    "title": "Bounded ring buffer that keeps the newest N events",
    "group": "Logging",
    "needs": "L01",
    "assessment": "Tested"
  },
  {
    "id": "M04",
    "label": "M04",
    "title": "Peak capture: largest acceleration and duration of each exceedance event",
    "group": "Logging",
    "needs": "L01",
    "assessment": "Tested"
  },
  {
    "id": "L02",
    "label": "L02",
    "title": "Persistent event storage: at least 20 events survive a restart",
    "group": "Logging",
    "needs": "L01",
    "assessment": "Tested"
  },
  {
    "id": "L06",
    "label": "L06",
    "title": "Wall-clock time set from the host computer",
    "group": "Logging",
    "needs": "L01",
    "assessment": "Tested"
  },
  {
    "id": "M02",
    "label": "M02",
    "title": "Low-pass filtering with a stated method and cutoff",
    "group": "Signal processing and robustness",
    "assessment": "Tested"
  },
  {
    "id": "R02",
    "label": "R02",
    "title": "Watchdog: the monitor recovers from a deliberate stall and reports why it restarted",
    "group": "Signal processing and robustness",
    "assessment": "Tested"
  },
  {
    "id": "M01",
    "label": "M01",
    "title": "Accelerometer zero and scale calibration",
    "group": "Signal processing and robustness",
    "assessment": "Tested"
  },
  {
    "id": "M03",
    "label": "M03",
    "title": "Dynamic acceleration estimate with gravity removed",
    "group": "Signal processing and robustness",
    "needs": "M02",
    "assessment": "Tested"
  },
  {
    "id": "R01",
    "label": "R01",
    "title": "Sensor reconnect: the monitor recovers when a sensor cable is unplugged and plugged back in",
    "group": "Signal processing and robustness",
    "assessment": "Tested by hand"
  },
  {
    "id": "R05",
    "label": "R05",
    "title": "Wireless status delivery over the local network",
    "group": "Signal processing and robustness",
    "assessment": "Your evidence"
  },
  {
    "id": "X1",
    "label": "X1",
    "title": "High-rate and adaptive sampling",
    "group": "Challenges",
    "assessment": "tested, partly by hand",
    "body": "<p>The core needs the IMU sampled at 50 Hz or more. This challenge raises that to several hundred hertz, with no samples lost while the screen updates and the menus are used. A simple main loop cannot do this, because a screen redraw blocks it for tens of milliseconds. You need either the ICM-20948's built-in FIFO (a buffer on the sensor chip that stores samples until you read them in a burst) or FreeRTOS tasks, or both.</p>\n<p>The sampling is also adaptive: the monitor runs at a lower rate when nothing is happening, and raises the rate when it detects a disturbance. It lowers the rate again once things are quiet.</p>\n<p>The state reply reports the current sample rate and a count of lost samples, so the lecturer can check both while using the buttons.</p>",
    "baseline": "Fixed-rate polling in the main loop.",
    "target": "No lost samples at 400 Hz over 10 minutes with the screen updating; the rate rises within 50 ms of a knock."
  },
  {
    "id": "X2",
    "label": "X2",
    "title": "Shock recording with pre-trigger",
    "group": "Challenges",
    "assessment": "tested",
    "body": "<p>When a knock exceeds the acceleration limit, the monitor saves the raw samples from before and after the knock, so that the shape of the shock can be examined later. To have the samples from before the knock, the monitor must keep a rolling buffer of recent samples at all times.</p>\n<p>The recording must cover at least 200 ms before and 200 ms after the trigger, at 200 Hz or more. No samples may be lost while a recording is saved, and monitoring and alarms must keep running while a recording is exported over serial. Peak capture (M04) records only the peak and duration of a knock; this challenge keeps the whole waveform, which makes it a memory and timing problem.</p>",
    "needs": "M04",
    "baseline": "Recording only from the trigger onwards.",
    "target": "The last five recordings kept, each exported in under 2 seconds, with no monitoring sample missed during export."
  },
  {
    "id": "X3",
    "label": "X3",
    "title": "Vibration analysis",
    "group": "Challenges",
    "assessment": "tested",
    "body": "<p>The monitor reports the main frequency of vibration and its size, worked out over a window of recent accelerometer samples. You choose the method, for example an FFT (fast Fourier transform) or the Goertzel algorithm, and the window length. The sample rate limits the highest frequency you can measure: at 50 Hz sampling you cannot measure anything above 25 Hz.</p>\n<p>The lecturer tests this by sending sine waves of known frequency, with noise added, over serial.</p>",
    "baseline": "Counting zero crossings.",
    "target": "Frequency within 0.5 Hz of the true value from 1 to 20 Hz, with the result updated every second."
  },
  {
    "id": "X4",
    "label": "X4",
    "title": "Fused tilt during motion",
    "group": "Challenges",
    "assessment": "tested",
    "body": "<p>The core measures tilt from the accelerometer alone, using the direction of gravity. That works while the unit is still. When the unit moves, for example when a van brakes, the accelerometer measures gravity plus the motion, so the tilt reading jumps even though the box has not rotated.</p>\n<p>The gyroscope measures how fast the unit rotates and is not affected by that motion. Adding up its readings gives the change in angle, but small errors build up, so the angle slowly drifts. A fused estimate combines the two sensors: it follows the gyroscope over short times and lets the accelerometer correct the drift over long times. Common methods are a complementary filter and a Kalman filter.</p>\n<p>The lecturer tests this with sequences of rotation and motion sent over serial, where the true angle is known.</p>",
    "baseline": "The accelerometer-only tilt from the core.",
    "target": "Tilt error under 2° during a braking sequence, and drift under 1° per minute at rest."
  },
  {
    "id": "X5",
    "label": "X5",
    "title": "Adaptive filtering",
    "group": "Challenges",
    "assessment": "tested",
    "body": "<p>A fixed low-pass filter (M02) has to trade two things against each other. Heavy filtering gives a smooth reading at rest but reacts slowly to a real change. Light filtering reacts quickly but leaves noise. An adaptive filter changes its behaviour with the signal: it filters heavily when the signal is steady and lightly when something is happening. You choose the method, for example a cutoff that changes with the measured signal variance, an LMS (least mean squares) filter, or a simple Kalman filter.</p>\n<p>The lecturer tests this by sending steps with noise added over serial and measuring two things: the noise left at rest and how quickly the output follows a step.</p>",
    "needs": "M02",
    "baseline": "Your fixed M02 filter.",
    "target": "Half the noise at rest of M02, with a step response at least as fast."
  },
  {
    "id": "X6",
    "label": "X6",
    "title": "TinyML handling classifier",
    "group": "Challenges",
    "assessment": "tested if the lecturer's recorded handling traces are available, otherwise your evidence at a lower weight",
    "body": "<p>A small trained model running on the board classifies how the unit is being handled, with at least three classes, for example at rest, knocked and sustained vibration. You collect your own training data from the board, train the model, convert it to run on the ESP32-S3, and report its size, its speed and its accuracy on data you kept back from training.</p>\n<p>Because test readings pass through the same code as real readings, the lecturer may test the model by sending recorded handling traces over serial. The state reply reports the current class.</p>",
    "baseline": "A hand-written rule, such as thresholds on peak and variance.",
    "target": "90% correct on held-back data, with a result every 500 ms."
  }
];
