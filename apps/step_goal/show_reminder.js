function steps_per_hour(step_goal, start_hour, end_hour) {
  return Math.ceil(step_goal / (end_hour-start_hour));
}

function needed_steps(current_steps, step_goal, start_hour, end_hour, current_hour) {
  let _steps = steps_per_hour(step_goal, start_hour, end_hour);
  let steps_needed_at_this_hour = _steps*(current_hour-start_hour);
  return steps_needed_at_this_hour - current_steps;
}

function display_reminder() {
  var settings = Object.assign({
    goal_enabled: true,
    reminder_enabled: true,
    reminder_start_time: 9,
    reminder_stop_time: 21,
    has_triggered: false
  }, require("Storage").readJSON("step_goal.json", true) || {});

  var health_settings = require("Storage").readJSON("health.json",1)||{};
  const text_y = 40;
  const text_x = 10;
  const timeout = 6000;

  // Turn on the screen
  Bangle.setOptions({backlightTimeout: 0}); // turn off the screen timeout
  Bangle.setBacklight(1); // Turn display backlight on
  
  // Setup and display the base screen info
  g.clear();
  Bangle.buzz(1000, 0.1);
  g.setFont("Vector", 60);
  g.setColor(1, 1, 1);
  let remaining_steps = needed_steps(Bangle.getHealthStatus("day").steps, health_settings.stepGoal, settings.reminder_start_time, settings.reminder_stop_time, new Date().getHours());
  console.log(Bangle.getHealthStatus("day").steps);
  console.log(health_settings.stepGoal);
  console.log(settings.reminder_start_time);
  console.log(settings.reminder_stop_time);
  console.log(new Date().getHours());
  g.drawString(` ${remaining_steps.toString().padStart(8, ' ')}\n  steps this\n  hour to hit\n  your goal`, text_x, text_y);
  return new Promise(resolve=>setTimeout(resolve, timeout)).then(()=>{
    Bangle.setOptions({backlightTimeout: require("Storage").readJSON("setting.json",1).timeout});
    eval(require("Storage").read(require("Storage").readJSON("setting.json",1).clock));
  });
}

function main() {
  display_reminder();
}

main();