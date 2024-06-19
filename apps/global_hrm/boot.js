// TODO
// Add get HRM on wakeup
// Add "sports mode" if HRM is over a threshold use different interval
// Add fake confidence setting for compatibility 

// Create the global HRM object
global.hrm = Object.assign({
  bpm: undefined,
  confidence: 0,
  enabled: true,
  update_interval_in_minutes: 1,
  bpm_confidence: 80,
  disable_HRM_lockout: false
}, require("Storage").readJSON("global_hrm.json", true) || {});

var global_hrm = (function () {
  function _get_HRM(data) {
    // Check if we are over the confidence value and that bpm isn't 0. 
    // The over 0 check was cause of a strange case where the sensor would report a high confidence of a 0 bpm. Not sure why
    if (data.confidence > global.hrm.bpm_confidence && data.bpm > 0) {
      // Don't bother to change anything if the values are the same
      if (data.bpm != global.hrm.bpm && data.confidence != global.hrm.confidence) {

        // Save the HRM value to the global variable
        global.hrm.bpm = data.bpm;
        global.hrm.confidence = data.confidence;

        // Log the time
        global.hrm.time = Math.round(new Date().getTime());

        // Emit an HRM event with our new values
        Bangle.emit("HRM", {"bpm": global.hrm.bpm, "confidence": global.hrm.confidence});
        console.log(`Global HRM Update BPM: ${data.bpm} confidence: ${data.confidence}`);
        // Save our new values in case of a reload
        require("Storage").writeJSON("global_hrm.json", global.hrm);
      }
      Bangle.oldSetHRMPower(false, "global_hrm");
    }
  }
  // Turns on the HRM sensor than waits till the confidence value is above the user specified value
  // Than records it to the global variable and to a file. We also emit a HRM event so everything updates to our new value
  function updateHrm() {
    Bangle.oldSetHRMPower(true, "global_hrm");
  }

  function run() {
    updateHrm();
    setInterval(updateHrm, global.hrm.update_interval_in_minutes*60*1000);
  }

  // When enabled update HRM value than do it again when it's time
  if (global.hrm.enabled) {
    Bangle.on('HRM',_get_HRM);
    // Load and emit the saved HRM value
    if (global.hrm.bpm !== "undefined") {
      Bangle.emit("HRM", {"bpm": global.hrm.bpm, "confidence": global.hrm.confidence});
    }
    // Save the old setHRMPower function so we can use it
    Bangle.oldSetHRMPower = Bangle.setHRMPower;
    // Disable setHRMPower so no other programs can use it
    Bangle.setHRMPower = function(on, id) {
      if (global.hrm.enabled && !global.hrm.disable_HRM_lockout) {
          return on;
      }
      // If we are disabled or the lockout is disabled do a passthrough to the original function
      else {
          return Bangle.oldSetHRMPower(on, id);
        }
    };
    // Check if we haven't ran before and if so run immediately.
    let delay = global.hrm.time+(global.hrm.update_interval_in_minutes*60*1000)-Math.round(new Date().getTime());
    if (global.hrm.time == "undefined" || delay < 0) {run();}
    else {
      setTimeout(run, delay);
    }
  }
  else {
    delete global.hrm;
  }

  return {
    updateHrm,
    _get_HRM
  };
})();
