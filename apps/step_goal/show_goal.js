{
  let img = function() {
  return require("heatshrink").decompress(atob("mEw4UA///i3/1P7vN8IGkFqALJitUBZNVqoLqgtAHYcBJQgICKYRKFitVDAIWBqoLEgotDAYJuFA4N//o9HDAILCQo8VBYKEIgLYBHwQAGBYJ3JBceq1QKIgQLBwALHhQLB0ALHlQLB1AuJGBIVBDII6I0AxBHgwICBwQ6HEwYuHB4oLED4QnBHQwQEHgkCFQkqJAoiBfIUKd44LBd5EVAQILIABcBEYNABRIMIiosCAYYWEAoYYFgIFKAFo"));
  };
  
  let buz_watch = function() {
    Bangle.buzz(1000, 0.1).then(()=>{
    return new Promise(resolve=>setTimeout(resolve,500)); // wait 500ms
    }).then(()=>{
      return Bangle.buzz(1000, 1);
    }).then(()=>{
      return new Promise(resolve=>setTimeout(resolve,500)); // wait 500ms
    }).then(()=>{
      return Bangle.buzz(1000, 0.1);
    });
  };
  
  let display_graphic = function() {
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
    let health_settings = require("Storage").readJSON("health.json",1)||{};
    const timeout = 10000;
    const sayings = ["You did it!", "You got them all!", "Good job!", "Amazing!"];
    const random = Math.floor(Math.random() * sayings.length);
  
    // Turn on the screen
    Bangle.setOptions({backlightTimeout: 0}); // turn off the screen timeout
  
    // Setup and display the base screen info
    Bangle.loadWidgets();
    g.clear();
    g.setFont("Vector", 20);
    g.drawImage(img(), g.getWidth()/2, g.getHeight()/2.5, {scale:2, rotate:0});
    g.setFontAlign(0,0);
    g.drawString(sayings[random], g.getWidth()/2, 130);
    g.drawString(`${health_settings.stepGoal} / ${health_settings.stepGoal}`, g.getWidth()/2, 160);
    Bangle.drawWidgets();
    buz_watch();
  
    Bangle.setBacklight(1); // Turn display backlight on
  
    // Set that we have shown the screen
    settings.has_triggered = true;
    setSettings();
  
    // Wait for our timeout than return to clock.
    return new Promise(resolve=>setTimeout(resolve,timeout)).then(()=>{
      // Bangle.setOptions({backlightTimeout: require("Storage").readJSON("setting.json",1).timeout*1000});
      // eval(require("Storage").read(require("Storage").readJSON("setting.json",1).clock));
      load();
    });
  };
  display_graphic();
}