function step_goal_notif() {
  var health_settings = require("Storage").readJSON("health.json",1)||{};
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
  
  function achieved_step_goal() {
    load('step_goal.show_goal.js');
  }
  
  function main() {
    // Check if the message has been shown already
    if (!settings.has_triggered) {
      // Check if we are at or over our step goal
      if (Bangle.getHealthStatus("day").steps >= health_settings.stepGoal && settings.goal_enabled == true) {
        // Trigger the message
        achieved_step_goal();
      }
    }
    // If we have shown the screen
    else {
      // Check if we aren't over our step goal
      // Note: This code is for when someone changes their step goal after it has been reached for the day.
      if (Bangle.getHealthStatus("day").steps <= health_settings.stepGoal) {
        // Set has_triggered to false so the screen can run once the goal is reached.
        settings.has_triggered = false;
        setSettings();
      }
    }
  }

  // Make it so we run the function that resets the has_triggered var so we can run again the next day.
  Bangle.on('midnight', function() { step_goal_reset(); });
  main();
  setInterval(main, 60000);
}

// Resets the has_triggered step goal
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