{
  let img1 = function() {
    return require("heatshrink").decompress(atob("mEw4cA///hFC1P930kkX65FqtGLtFSFKsSpAQOgmSpIRRkARNkmbyUkBY4aFm8kyXEA4eSJwMBDQspCINEHggROBgIRChIRF5ILBrAFBBgOpIgIRGpIdDAoQOCOgwJByVAUoIMBCJxEEgSqHkmQgE0CgQRMhu2yQrDHQIQFgOkyVN23QHojyGtoJBtu24ARKgYRD2BhFCIsbtu0zdtwC0EPgwRB23bthODCJHbCOhWBCJ+TCKCeCCPTEBpMpkgRMpMipMlkjNCCJEBlIRDdQgRGhMpgVJkgUBCJQOBAQMgCgJbDyRjCKIQODCgYkDCI0AiQGBwEJCL0qNYNACJZ3BCKMOpNv4EBCJkJ7mSoARNdQQDBCJQACgjVECJYAIkmQCKMJCOQAgA=="));
  };
  let img2 = function() {
    return require("heatshrink").decompress(atob("mEw4cA///1P9yd85X9vN8pP8+ms1P7KPsZlgRP7dtwAR/CKxrRAEU30mTmwQMgO3kmSm3ACJcN3oRBs3YCJdt3IRBo3bCBUDtvpCINM7dgCJMbtvJCINI7dsWBVspIRCC4K2IgwvBCIY7B2ARHmxTBCIZfB2wPFgVLmx3BCIkN2+SoAREpO2TYIREgO26QRFoIsCr////6HwXCCIoFDCIoLFCNe/CJMAMgIRC/oREiSQFCM7aBhrUDCI0JCJOQCLEgCIXYCIcECI0BCJOACI0kCIcMCIUkCIwIBCIYIGAAosCCIg+DCIxQBCIhiDAA2SCItJCBCqBoARDgS8DAA0CpMCrApCoARJF4JlCkg7BABSSByQUBRg5cHKxQAh"));
  };
  let img3 = function() {
    return require("heatshrink").decompress(atob("mEw4UA///5X9vEF9dSIW0BqgLJgtVBZMVqtABdMBHAI7ICgNaKZFVqtq0BnHqsFtWqEQ9QgGqBZFAgWq1ZGGisABYOpLxEK1WtE4ILI0oLIlWq2ILKwK/IKQRvBDIsD9QLK/2oSYQLFh//9C8IBYPwBZE///8BZH/AAILL4AKGgf/4YwGdINXEIIwGLANVBAM/BZFwKoPVEY1VY4LyBJBALBUxAcCBZbKIIAQLLHwIAIJQQLJKRReWgBGKAFQA=="));
  };

  let buz_watch = function() {
    Bangle.buzz(1000, 0.1);
  };

  let steps_per_hour = function(step_goal, start_hour, end_hour) {
    return Math.ceil(step_goal / (end_hour-start_hour));
  };

  let needed_steps = function(current_steps, step_goal, start_hour, end_hour, current_hour) {
    let _steps = steps_per_hour(step_goal, start_hour, end_hour);
    let steps_needed_at_this_hour = _steps*(current_hour-start_hour);
    return steps_needed_at_this_hour - current_steps;
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
    var health_settings = require("Storage").readJSON("health.json",1)||{};
    const timeout = 10000;
    // Random options
    const sayings = ["Get up and move!", "Stop being lazy!", "Go walk around!"];
    const images = [img1,img2,img3];

    // Generate our random image and string
    const random_saying = Math.floor(Math.random() * sayings.length);
    const random_image = Math.floor(Math.random() * images.length);

    // Find remaining steps
    let remaining_steps = needed_steps(Bangle.getHealthStatus("day").steps, health_settings.stepGoal, settings.reminder_start_time, settings.reminder_stop_time, new Date().getHours());

    // Turn on the screen
    Bangle.setOptions({backlightTimeout: 0}); // turn off the screen timeout

    // Setup and display the base screen info
    Bangle.loadWidgets();
    g.clear();
    g.setFont("Vector", 20);
    g.drawImage(images[random_image](), g.getWidth()/2, g.getHeight()/3, {scale:1.5, rotate:0});
    g.setFontAlign(0,0);
    g.drawString(sayings[random_saying], g.getWidth()/2, 100);
    g.drawString(`Get ${require("locale").number(remaining_steps).split('.')[0]}\n steps this hour`, g.getWidth()/2, 140);
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