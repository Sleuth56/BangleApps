var live_metrics = (function () {
  var settings = Object.assign({
    enabled: false,
    update_interval_in_minutes: 1,
    bangle_id: '',
    server_url: '',
    enable_basic_auth: false,
    basic_auth_username: '',
    basic_auth_password: ''
  }, require("Storage").readJSON("live_metrics.json", true) || {});

  r = require("Storage").open("live_metrics.cache","r");
  r.readLine();

  function gather_data() {
    now = now_to_current_minute().getTime();
    
    
  }

  function start() {
    gather_data();
    setInterval(gather_data, settings.update_interval_in_minutes*60*1000);
  }

  if (settings.enabled) {
    // Activate listeners
    Bangle.on("live_metrics_barometer", persist_barometer);
    Bangle.on("live_metrics_done", done);

    // If custom id isn't specified use device ID.
    if (settings.bangle_id == '') {
      settings.bangle_id = NRF.getAddress().substr().substr(12).replace(':', '');
    }
    // Calculate time till next run time
    let now = new Date();
    ms_to_next_minute = (60 - now.getSeconds()) * 1000 + (settings.update_interval_in_minutes-1)*60*1000;

    setTimeout(start, ms_to_next_minute);
  }
  else {
    delete settings;
  }

  return {
    settings
  };
})();