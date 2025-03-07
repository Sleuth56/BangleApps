(function (back) {
  var settings = Object.assign({
    enabled: false,
    update_interval_in_minutes: 1,
    bangle_id: '',
    server_url: '',
    enable_basic_auth: false,
    basic_auth_username: '',
    basic_auth_password: ''
  }, require("Storage").readJSON("live_metrics.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("live_metrics.json", settings);
  }

  E.showMenu({
    "": { title: /*LANG*/"Live Metrics" },

    /*LANG*/"< Back": () => back(),

    /*LANG*/"Enabled": {
      value: "enabled" in settings ? settings.enabled : true,
      onchange: () => {
        settings.enabled = !settings.enabled;
        setSettings();
      }
    },

    /*LANG*/"Update Interval in M": {
      value: settings.update_interval_in_minutes,
      min: 1,
      max: 24,
      step: 1,
      onchange: v => {
        settings.update_interval_in_minutes = v;
        setSettings();
      }
    },

    /*LANG*/"Basic Auth": {
      value: "enable_basic_auth" in settings ? settings.enable_basic_auth : true,
      onchange: () => {
        settings.enable_basic_auth = !settings.enable_basic_auth;
        setSettings();
      }
    },
    "Delete history file": ()=>{
      require("Storage").erase('live_metrics.data.json');
      E.showMessage("Deleted data file");
    }
  });
});
