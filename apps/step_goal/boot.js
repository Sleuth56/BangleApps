let step_goal = (function () {
  let health_settings = require("Storage").readJSON("health.json",1)||{};
  let settings = Object.assign({
    goal_enabled: true,
    reminder_enabled: true,
    reminder_start_time: 9,
    reminder_stop_time: 21,
    has_triggered: false,
    reminder_minute: 50
  }, require("Storage").readJSON("step_goal.json", true) || {});

  let setSettings = function() {
    require("Storage").writeJSON("step_goal.json", settings);
  };

  let steps_per_hour = function(step_goal, start_hour, end_hour) {
    return Math.ceil(step_goal / (end_hour-start_hour));
  };

  let needed_steps = function(current_steps, step_goal, start_hour, end_hour, current_hour) {
    let _steps = steps_per_hour(step_goal, start_hour, end_hour);
    let steps_needed_at_this_hour = _steps*(current_hour-start_hour);
    return steps_needed_at_this_hour - current_steps;
  };

  let enough_steps = function(current_steps, step_goal, start_hour, end_hour, current_hour) {
    let _needed_steps = needed_steps(current_steps, step_goal, start_hour, end_hour, current_hour);

    if (current_hour >= end_hour-1) {
      return true;
    }
    if (_needed_steps > 0) {
      return false;
    }
    else {
      return true;
    }
  };

  let step_reminder = function() {
    if (settings.reminder_enabled) {
      if (!enough_steps(Bangle.getHealthStatus("day").steps, health_settings.stepGoal, settings.reminder_start_time, settings.reminder_stop_time, new Date().getHours())) {
        Bangle.setUI();
        eval(require("Storage").read("step_goal.show_reminder.js"));
      }
      else {
        console.log("Step_goal: Steps for this hour are met.");
      }
      setInterval(step_reminder, 3600000);
    }
  };

  let check_step_goal = function() {
    // Check if the message has been shown already
    if (!settings.has_triggered) {
      // Check if we are at or over our step goal
      if (Bangle.getHealthStatus("day").steps >= health_settings.stepGoal && settings.goal_enabled == true) {
        // Trigger the message
        Bangle.setUI();
        eval(require("Storage").read("step_goal.show_goal.js"));
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
  };
  
  // Resets the has_triggered step goal
  let step_goal_reset = function() {
    let settings = Object.assign({
      goal_enabled: true,
      reminder_enabled: true,
      reminder_start_time: 9,
      reminder_stop_time: 21,
      has_triggered: false,
      reminder_minute: 50
    }, require("Storage").readJSON("step_goal.json", true) || {});
  
    let setSettings = function() {
      require("Storage").writeJSON("step_goal.json", settings);
    };
    settings.has_triggered = false;
    setSettings();
  };

  // Make it so we run the function that resets the has_triggered var so we can run again the next day.
  Bangle.on('midnight', function() { step_goal_reset(); });
  check_step_goal();
  setInterval(check_step_goal, 60000);

  let now = new Date();
  let seconds_left = (60-now.getSeconds())+(settings.reminder_minute-now.getMinutes())*60;
  if (seconds_left > 1) {setTimeout(step_reminder, seconds_left*1000);}

  return {
   settings,
   steps_per_hour,
   needed_steps,
   enough_steps,
   step_reminder,
   check_step_goal,
   step_goal_reset
  };
})();