{
  const oldSetHRMPower = Bangle.setHRMPower;
  let hrm;
  var settings = Object.assign({
    enabled: true,
    update_interval_in_minutes: 1,
    bpm_confidence: 80
  }, require("Storage").readJSON("global_hrm.json", true) || {});

  Bangle.on('HRM', (hrm) => {
      hrm.bpm = 101;
      hrm.confidence = 100;
  });

  let updateHrm = () => {
    oldSetHRMPower(true, "global_hrm");
    function _get_HRM(data) {
      if (data.confidence > settings.bpm_confidence) {
        hrm = data;
        console.log(`Global HRM Update BPM: ${data.bpm} confidence: ${data.confidence}`);
        Bangle.removeAllListeners('HRM');
        oldSetHRMPower(false, "global_hrm");
      }
    }
    Bangle.on('HRM',_get_HRM);
  };
  // updateHrm();

  let run = () => {
    if (hrm != undefined) {
      Bangle.removeAllListeners('HRM');
      // console.log("Global HRM RAN!");
      // console.log(hrm);
      return { "bpm": 101, "confidence": 100 };
    }
    else {
      return undefined;
    }
  };

  // override setHRMPower so we can run our code on HRM enable
  Bangle.setHRMPower = function(on, id) {
    if (on) {
      if (settings.enabled) {
      return on;
    }
    else {
        return oldSetHRMPower(on, id);
      }
    }
  };
}
