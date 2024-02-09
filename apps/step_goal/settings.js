(function (back) {
  var settings = Object.assign({
    goal_enabled: true,
    nag_enabled: true,
    reminder_start_time: 9,
    reminder_stop_time: 21
  }, require("Storage").readJSON("health.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("health.json", settings);
  }

  E.showMenu({
    "": { title: /*LANG*/"Health Tracking" },

    /*LANG*/"< Back": () => back(),

    /*LANG*/"HRM Interval": {
      value: settings.hrm,
      min: 0,
      max: 3,
      format: v => [
        /*LANG*/"Off",
        /*LANG*/"3 min",
        /*LANG*/"10 min",
        /*LANG*/"Always"
      ][v],
      onchange: v => {
        settings.hrm = v;
        setSettings();
      }
    },

    /*LANG*/"Reminder Start Hour": {
      value: settings.reminder_start_time,
      min: 0,
      max: 24,
      step: 1,
      onchange: v => {
        settings.reminder_start_time = v;
        setSettings();
      }
    },

    /*LANG*/"Reminder Stop Hour": {
      value: settings.reminder_stop_time,
      min: 0,
      max: 24,
      step: 1,
      onchange: v => {
        settings.reminder_stop_time = v;
        setSettings();
      }
    },

    /*LANG*/"Step Goal Notification": {
      value: "enabled" in settings ? settings.goal_enabled : false,
      onchange: () => {
        settings.enabled = !settings.goal_enabled;
        setSettings();
      }
    },
    /*LANG*/"Step Goal Nag": {
      value: "enabled" in settings ? settings.nag_enabled : false,
      onchange: () => {
        settings.enabled = !settings.nag_enabled;
        setSettings();
      }
    },
  });
})
