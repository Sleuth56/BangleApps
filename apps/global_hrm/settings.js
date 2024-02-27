(function (back) {
  var settings = Object.assign({
    enabled: true,
    update_interval_in_minutes: 1,
    bpm_confidence: 80
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

    /*LANG*/"Update Interval In Seconds ": {
      value: settings.update_interval_in_minutes,
      min: 0,
      max: 60,
      step: 1,
      onchange: v => {
        settings.update_interval_in_minutes = v;
        setSettings();
      }
    },

    /*LANG*/"BPM Confidence": {
      value: settings.update_interval_in_minutes,
      min: 0,
      max: 100,
      step: 10,
      onchange: v => {
        settings.update_interval_in_minutes = v;
        setSettings();
      }
    },
  });
});
