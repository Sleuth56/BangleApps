(function (back) {
  var settings = Object.assign({
    goal_enabled: true,
    nag_enabled: true,
    reminder_start_time: 9,
    reminder_stop_time: 21,
    has_triggered: false
  }, require("Storage").readJSON("step_goal.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("step_goal.json", settings);
  }

  E.showMenu({
    "": { title: /*LANG*/"Step Goal" },

    /*LANG*/"< Back": () => back(),

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
      value: "enabled" in settings ? settings.goal_enabled : true,
      onchange: () => {
        settings.enabled = !settings.goal_enabled;
        setSettings();
      }
    },
    /*LANG*/"Step Goal Nag": {
      value: "enabled" in settings ? settings.nag_enabled : true,
      onchange: () => {
        settings.enabled = !settings.nag_enabled;
        setSettings();
      }
    },
  });
})
