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

function display_nag() {
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
  var health_settings = require("Storage").readJSON("health.json",1)||{};
  const text_y = 40;
  const text_x = 10;
  const steps_text_y = 110;
  const steps_text_x = 0;
  const timeout = 6000;

  // Turn on the screen
  Bangle.setOptions({backlightTimeout: 0}); // turn off the screen timeout
  Bangle.setBacklight(1); // Turn display backlight on
  
  // Setup and display the base screen info
  g.clear();
  Bangle.buzz(1000, 0.1);
  g.setFont("6x8:2x3");
  g.setColor(1, 1, 1);
  let remaining_steps = Math.round(needed_steps(Bangle.getHealthStatus("day").steps, health_settings.stepGoal, settings.reminder_start_time, settings.reminder_stop_time, new Date().getHours()));
  console.log(Bangle.getHealthStatus("day").steps);
  console.log(health_settings.stepGoal);
  console.log(settings.reminder_start_time);
  console.log(settings.reminder_stop_time);
  console.log(new Date().getHours());
  g.drawString(` ${remaining_steps.toString().padStart(8, ' ')}\n steps to hit\n   your goal`, text_x, text_y);
  return new Promise(resolve=>setTimeout(resolve, timeout)).then(()=>{
    load();
  });
}

function main() {
  display_nag();
}

main();