(function (back) {
  let settings = Object.assign({
    goal_enabled: true,
    reminder_enabled: true,
    reminder_start_time: 9,
    reminder_stop_time: 21,
    has_triggered: false,
    reminder_minute: 50
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
      value: "goal_enabled" in settings ? settings.goal_enabled : true,
      onchange: () => {
        settings.goal_enabled = !settings.goal_enabled;
        setSettings();
      }
    },

    /*LANG*/"Step Goal Reminder": {
      value: "reminder_enabled" in settings ? settings.reminder_enabled : true,
      onchange: () => {
        settings.reminder_enabled = !settings.reminder_enabled;
        setSettings();
      }
    },

    /*LANG*/"Minute To Get Reminder": {
      value: settings.reminder_minute,
      min: 10,
      max: 50,
      step: 10,
      onchange: v => {
        settings.reminder_minute = v;
        setSettings();
      }
    },
  });
});
