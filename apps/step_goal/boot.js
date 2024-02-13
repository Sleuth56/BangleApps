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

  function needed_steps(current_steps, step_goal, current_hour, end_hour) {
    let remaining_steps = step_goal - current_steps;
    let remaining_time = end_hour - current_hour;
    console.log(`remaining steps: ${remaining_steps}, remaining time ${remaining_time}`);

    if (remaining_time <= 0) { return 0; }

    if (remaining_steps <= 0 ) { 
      return 0; 
    }
    else {
      return Math.round(remaining_steps / remaining_time);
    }
  }

  function main() {
    // Check if the message has been shown already
    if (!settings.has_triggered) {
      // Check if we are at or over our step goal
      if (Bangle.getHealthStatus("day").steps >= health_settings.stepGoal && settings.goal_enabled == true) {
        // Trigger the message
        load('step_goal.show_goal.js');
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

    if (needed_steps(Bangle.getHealthStatus("day").steps, health_settings.stepGoal, new Date().getHours(), settings.reminder_stop_time) > 0) {
      load('step_goal.show_nag.js');
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