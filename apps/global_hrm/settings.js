(function (back) {
  var settings = Object.assign({
    enabled: true,
    update_interval_in_minutes: 1,
    bpm_confidence: 80,
    disable_HRM_lockout: false
  }, require("Storage").readJSON("global_hrm.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("global_hrm.json", settings);
  }

  E.showMenu({
    "": { title: /*LANG*/"Global HRM" },

    /*LANG*/"< Back": () => back(),

    /*LANG*/"Enabled": {
      value: "enabled" in settings ? settings.enabled : true,
      onchange: () => {
        settings.enabled = !settings.enabled;
        setSettings();
      }
    },

    /*LANG*/"Update Interval In Minutes ": {
      value: settings.update_interval_in_minutes,
      min: 1,
      max: 60,
      step: 1,
      onchange: v => {
        settings.update_interval_in_minutes = v;
        setSettings();
      }
    },

    /*LANG*/"BPM Confidence": {
      value: settings.bpm_confidence,
      min: 0,
      max: 100,
      step: 10,
      onchange: v => {
        settings.bpm_confidence = v;
        setSettings();
      }
    },

    /*LANG*/"Disable HRM Lockout": {
      value: "disable_HRM_lockout" in settings ? settings.disable_HRM_lockout : true,
      onchange: () => {
        settings.disable_HRM_lockout = !settings.disable_HRM_lockout;
        setSettings();
      }
    },
  });
})
