function step_goal_notif() {
  var settings = Object.assign({
    goal_enabled: true,
    nag_enabled: true,
    reminder_start_time: 9,
    reminder_stop_time: 21
  }, require("Storage").readJSON("step_goal.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("step_goal.json", settings);
  }

  var health_settings = require("Storage").readJSON("health.json",1)||{};
  if (settings.has_triggered == undefined) {
    settings.has_triggered = false;
    setSettings();
  }
  
  function achieved_step_goal() {
    load('step_goal.show_goal.js');
  }
  
  function main() {
    if (!settings.has_triggered) {
      if (Bangle.getHealthStatus("day").steps >= health_settings.stepGoal) {
        settings.has_triggered = true;
        setSettings();
        achieved_step_goal();
      }
    }
    else {
      if (Bangle.getHealthStatus("day").steps <= health_settings.stepGoal) {
        settings.has_triggered = false;
        setSettings();
      }
    }
  }

  Bangle.on('midnight', function() { step_goal_reset(); });
  main();
  setInterval(main, 60000);
}

function step_goal_reset() {
  var settings = Object.assign({
    goal_enabled: true,
    nag_enabled: true,
    reminder_start_time: 9,
    reminder_stop_time: 21
  }, require("Storage").readJSON("step_goal.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("step_goal.json", settings);
  }
  settings.has_triggered = false;
  setSettings();
}

step_goal_notif();