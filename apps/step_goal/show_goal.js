function buz_watch() {
  Bangle.buzz(1000, 0.1).then(()=>{
  return new Promise(resolve=>setTimeout(resolve,500)); // wait 500ms
  }).then(()=>{
    return Bangle.buzz(1000, 1);
  }).then(()=>{
    return new Promise(resolve=>setTimeout(resolve,500)); // wait 500ms
  }).then(()=>{
    return Bangle.buzz(1000, 0.1);
  });
}

function display_graphic() {
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
  const steps_text_x = 60;
  const timeout = 2000;

  // Turn on the screen
  Bangle.setOptions({backlightTimeout: 0}); // turn off the screen timeout
  Bangle.setBacklight(1); // Turn display backlight on
  
  // Setup and display the base screen info
  g.clear();
  g.setFont("6x8:2x3");
  g.setColor(1, 1, 1);
  g.drawString(" You made it\nto your goal!", text_x, text_y);
  g.setColor(1, 0, 0);
  g.drawString(`${health_settings.stepGoal-1}`, steps_text_x, steps_text_y);

  // Set that we have shown the screen
  settings.has_triggered = true;
  setSettings();

  // Screen animation
  return new Promise(resolve=>setTimeout(resolve, timeout)).then(()=>{
    g.clearRect(steps_text_x, steps_text_y, 200, 300);
    g.setColor(0, 1, 1);
    g.setFont("6x8:2x3");
    g.drawString(`${health_settings.stepGoal}`, steps_text_x, steps_text_y);
  }).then(()=>{
    return new Promise(resolve=>setTimeout(resolve,timeout*3));
  }).then(()=>{
    //load();
  });
}

function main() {
  display_graphic();
  buz_watch();
}

main();