function step_goal_notif() {
  var health_settings = require("Storage").readJSON("health.json",1)||{};
  var settings = Object.assign({
    goal_enabled: true,
    reminder_enabled: true,
    reminder_start_time: 9,
    reminder_stop_time: 21,
    has_triggered: false
  }, require("Storage").readJSON("step_goal.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("step_goal.json", settings);
  }

  function steps_per_hour(step_goal, start_hour, end_hour) {
    return Math.ceil(step_goal / (end_hour-start_hour));
  }
  
  function needed_steps(current_steps, step_goal, start_hour, end_hour, current_hour) {
    let _steps = steps_per_hour(step_goal, start_hour, end_hour);
    let steps_needed_at_this_hour = _steps*(current_hour-start_hour);
    return steps_needed_at_this_hour - current_steps;
  }

  function enough_steps(current_steps, step_goal, start_hour, end_hour, current_hour) {
    let _needed_steps = needed_steps(current_steps, step_goal, start_hour, end_hour, current_hour);

    if (current_hour > end_hour-1) {
      return true;
    }
    if (_needed_steps > 0) {
      return false;
    }
    else {
      return true;
    }
  }

  function step_reminder() {
    if (settings.reminder_enabled) {
      if (!enough_steps(Bangle.getHealthStatus("day").steps, health_settings.stepGoal, settings.reminder_start_time, settings.reminder_stop_time, new Date().getHours())) {
        reset();
        eval(require("Storage").read("step_goal.show_reminder.js"));
      }
      else {
        console.log("Step_goal: Steps for this hour are met.");
      }
      setInterval(step_reminder, 3600000);
    }
  }

  function check_step_goal() {
    // Check if the message has been shown already
    if (!settings.has_triggered) {
      // Check if we are at or over our step goal
      if (Bangle.getHealthStatus("day").steps >= health_settings.stepGoal && settings.goal_enabled == true) {
        // Trigger the message
        reset();
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
  }

  // Make it so we run the function that resets the has_triggered var so we can run again the next day.
  Bangle.on('midnight', function() { step_goal_reset(); });
  check_step_goal();
  setInterval(check_step_goal, 60000);

  let now = new Date();
  let show_reminder_minute = 50;
  let seconds_left = (60-now.getSeconds())+(show_reminder_minute-now.getMinutes())*60;
  if (seconds_left > 1) {setTimeout(step_reminder, seconds_left*1000);}
}

// Resets the has_triggered step goal
function step_goal_reset() {
  var settings = Object.assign({
    goal_enabled: true,
    reminder_enabled: true,
    reminder_start_time: 9,
    reminder_stop_time: 21,
    has_triggered: false
  }, require("Storage").readJSON("step_goal.json", true) || {});
  
  function setSettings() {
    require("Storage").writeJSON("step_goal.json", settings);
  }
  settings.has_triggered = false;
  setSettings();
}

step_goal_notif();