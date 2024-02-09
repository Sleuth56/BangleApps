function step_goal_notif() {
  var health_settings = require("Storage").readJSON("health.json",1)||{};
  var settings = require("Storage").readJSON("step_goal.json",1)||{};
  if (settings.has_triggered == undefined) {
    write_to_config('has_triggered', false);
  }
  
  function achieved_step_goal() {
    load('step_goal.show_goal.js');
  }

  function write_to_config(key, value) {
    let json_file_data = require("Storage").readJSON("step_goal.json");
    if (typeof(json_file_data) == undefined) {
      json_file_data = {};
    }
    json_file_data[key] = value;
    require("Storage").writeJSON("step_goal.json", json_file_data);
  }
  
  function main() {
    if (!settings.has_triggered) {
      if (Bangle.getHealthStatus("day").steps >= health_settings.stepGoal) {
        write_to_config('has_triggered', true);
        achieved_step_goal();
      }
    }
    else {
      if (Bangle.getHealthStatus("day").steps <= health_settings.stepGoal) {
        write_to_config('has_triggered', false);
      }
    }
  }

  Bangle.on('midnight', function() { write_to_config('has_triggered', false); });
  main();
  setInterval(main, 60000);
}

step_goal_notif();