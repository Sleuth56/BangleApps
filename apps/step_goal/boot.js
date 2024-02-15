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

  function steps_per_hour(current_steps, step_goal, start_hour, end_hour) {
    let steps_left = step_goal - current_steps;
    return steps_left / (end_hour - start_hour);
  }
  
  function needed_steps(current_steps, step_goal, start_hour, end_hour, current_hour) {
    let test = steps_per_hour(0, step_goal, start_hour, end_hour);
    let hours_in = current_hour - start_hour;
  
    return test * hours_in;
  }
  
  function enough_steps(current_steps, step_goal, start_hour, end_hour, current_hour) {
    let needed_steps2 = needed_steps(current_steps, step_goal, start_hour, end_hour, current_hour);
  
    if (current_hour > end_hour) {
      return true;
    }
    if (needed_steps2 > current_steps) {
      return false;
    }
    else {
      return true;
    }
  }

  function step_reminder() {
    if (!enough_steps(Bangle.getHealthStatus("day").steps, health_settings.stepGoal, settings.reminder_start_time, settings.reminder_stop_time, new Date().getHours())) {
      load('step_goal.show_reminder.js');
    }
    else {
      console.log("Step_goal: Stets for this hour are met.")
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
  }

  function start_on_the_hour() {
    setInterval(step_reminder, 3600000);
  }

  // Make it so we run the function that resets the has_triggered var so we can run again the next day.
  Bangle.on('midnight', function() { step_goal_reset(); });
  main();
  setInterval(main, 60000);

  let now = new Date();
  let show_reminder_minute = 50;
  let seconds_left = (60-now.getSeconds())+(show_reminder_minute-now.getMinutes())*60;
  setTimeout(start_on_the_hour, seconds_left*1000);
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