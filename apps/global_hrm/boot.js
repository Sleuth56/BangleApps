global.hrm = Object.assign({
  bpm: undefined,
  confidence: 0
}, require("Storage").readJSON("global_hrm.json", true) || {});

{
  const oldSetHRMPower = Bangle.setHRMPower;
  var settings = Object.assign({
    enabled: true,
    update_interval_in_minutes: 1,
    bpm_confidence: 80,
    disable_HRM_lockout: false
  }, require("Storage").readJSON("global_hrm.json", true) || {});

  let setSettings = () => {
    require("Storage").writeJSON("global_hrm.json", settings);
  };

  let updateHrm = () => {
    oldSetHRMPower(true, "global_hrm");
    function _get_HRM(data) {
      if (data.confidence > settings.bpm_confidence && data.bpm > 0) {
        if (data.bpm != global.hrm.bpm && data.confidence != global.hrm.confidence) {
          global.hrm.bpm = data.bpm;
          global.hrm.confidence = data.confidence;
          settings.bpm = data.bpm;
          settings.confidence = data.confidence;
          console.log(`Global HRM Update BPM: ${data.bpm} confidence: ${data.confidence}`);
          setSettings();
        }
      oldSetHRMPower(false, "global_hrm");
      setInterval(updateHrm, settings.update_interval_in_minutes*60*1000);
      }
    }
    Bangle.on('HRM',_get_HRM);
  };

  if (settings.enabled) {
    updateHrm();
  }

  // Disable setHRMPower so no other programs can use it
  Bangle.setHRMPower = function(on, id) {
    if (settings.enabled && !settings.disable_HRM_lockout) {
        return on;
    }
    else {
        return oldSetHRMPower(on, id);
      }
  };
}
