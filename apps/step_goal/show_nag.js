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

function display_nag() {
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
  let remaining_steps = needed_steps(Bangle.getHealthStatus("day").steps, health_settings.stepGoal, new Date().getHours(), settings.reminder_stop_time);
  remaining_steps = '1234567890123';
  g.drawString(` ${remaining_steps}\n steps to hit\n   your goal`, text_x, text_y);
  // return new Promise(resolve=>setTimeout(resolve, timeout)).then(()=>{
  //   load();
  // });
}

function main() {
  display_nag();
}

main();