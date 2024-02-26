(function (back) {
  var settings = Object.assign({
    enabled: true,
    update_interval_in_minutes: 1
  }, require("Storage").readJSON("global_hrm.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("global_hrm.json", settings);
  }

  E.showMenu({
    "": { title: /*LANG*/"Step Goal" },

    /*LANG*/"< Back": () => back(),

    /*LANG*/"Enabled": {
      value: "enabled" in settings ? settings.enabled : true,
      onchange: () => {
        settings.enabled = !settings.enabled;
        setSettings();
      }
    },

    /*LANG*/"Update Interval In Seconds": {
      value: settings.update_interval_in_minutes,
      min: 0,
      max: 60,
      step: 1,
      onchange: v => {
        settings.update_interval_in_minutes = v;
        setSettings();
      }
    },
  });
});
