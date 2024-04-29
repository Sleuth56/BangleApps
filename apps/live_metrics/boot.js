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

  stored_data = require("Storage").open("live_metrics.cache","a");

  function http(url, method, body) {
    let creds = `${settings.basic_auth_username}:${settings.basic_auth_password}`;
    return new Promise(resolve => {
      Bangle.http(url, {
        headers: {'Authorization': `Basic ${btoa(creds)}`},
        method: method,
        body: body
      }).then(data=>{
        console.log("HTTP_Got ",data);
        return resolve(data);
      }).catch((err) => {
        console.log("HTTP_ERROR: ", err.toString());
        return resolve(undefined);
      });
    });
  }

  function check_connectivity() {
    return new Promise(resolve => {
    http(`${settings.server_url}/health`, 'get', '').then(resp => {
        if (resp != undefined && resp.resp == "OK") {
          return resolve(true);
        }
        else {
          return resolve(false);
        }
      }).catch((err) => {
          console.log("Got ", err.toString());
          return resolve(false);
        });
    });
  }

  function post_data(data) {
    console.log(data);
    check_connectivity().then(is_connected => {
      if (is_connected) {
        let url = `${settings.server_url}/api/v1/import/prometheus`;
        if (settings.enable_basic_auth) {
          let creds = `${settings.basic_auth_username}:${settings.basic_auth_password}`;
          Bangle.http(url, {
            headers: {'Authorization': `Basic ${btoa(creds)}`},
            method: "post",
            body: data
          }).then(data=>{
            console.log("Got ",data);
          }).catch((err) => {
            console.log("Got ", err.toString());
          });
        }
        else {
          Bangle.http(url, {
            method: "post",
            body: data
          }).then(data=>{
            console.log("Got ",data);
          }).catch((err) => {
            console.log("Got ", err.toString());
          });
        }
      }
      else {
        console.log("Not connected!");
      }
    });
  }

  function now_to_current_minute() {
    let coeff = 1000 * 60 * 1;
    let now = new Date();
    return new Date(Math.round(now.getTime() / coeff) * coeff);
  }

  function is_waring() {
    // If the watch is colder than 30C it's not being worn
    if (E.getTemperature() >= 24 || Bangle.getHealthStatus("last").movement >= 400) {
      return 1;
    }
    else {
      return 0;
    }
  }

  function gather_data(now) {
    let data = ``;

    // Current steps
    data += `banglejs_steps{id="${settings.bangle_id}"} ${Bangle.getHealthStatus("day").steps} ${now}\n`;
    // Battery in percentage
    data += `banglejs_battery{id="${settings.bangle_id}"} ${E.getBattery()} ${now}\n`;
    // Temperature in C
    data += `banglejs_temperature{id="${settings.bangle_id}"} ${E.getTemperature()} ${now}\n`;

    if (Bangle.isCharging() == true) {
      // Report that we are on a charger
      data += `banglejs_charging{id="${settings.bangle_id}"} ${1} ${now}\n`;
      data += `banglejs_waring{id="${settings.bangle_id}"} ${0} ${now}\n`;
    }
    // Is the watch not being worn?
    else if (!is_waring()) {
      data += `banglejs_charging{id="${settings.bangle_id}"} ${0} ${now}\n`;
      data += `banglejs_waring{id="${settings.bangle_id}"} ${0} ${now}\n`;
    }
    else {
      // Report that we are not on a charger
      data += `banglejs_charging{id="${settings.bangle_id}"} ${0} ${now}\n`;
      data += `banglejs_waring{id="${settings.bangle_id}"} ${1} ${now}\n`;
    }

    // Movement
    data += `banglejs_movement{id="${settings.bangle_id}"} ${Bangle.getHealthStatus("last").movement} ${now}\n`;

    return data;
  }

  function persist_barometer(now, data) {
    Bangle.getPressure().then(barometer_data=>{
      data += `banglejs_pressure{id="${settings.bangle_id}"} ${barometer_data.pressure} ${now}\n`;
      data += `banglejs_altitude{id="${settings.bangle_id}"} ${barometer_data.altitude} ${now}\n`;
      Bangle.emit("live_metrics_post_data", data);
    });
  }

  function get_HRM(now, data) {
    // Global HRM Check
    if (typeof global.hrm !== 'undefined' && global.hrm.enabled == true) {
      data += `banglejs_HRM{id="${settings.bangle_id}"} ${global.hrm.bpm} ${now}\n`;
      Bangle.emit("live_metrics_barometer", now, data);
    }
    // No global HRM
    else {
      Bangle.setHRMPower(true, "live_metrics");
      function _get_HRM(hrm_data) {
        if (hrm_data.confidence > 80) {
          Bangle.setHRMPower(false, "live_metrics");
          data += `banglejs_HRM{id="${settings.bangle_id}"} ${hrm_data.bpm} ${now}\n`;
          Bangle.emit("live_metrics_barometer", now, data);
        }
      }
      Bangle.on('HRM',_get_HRM);
    }
  }

  function start() {
    let now = now_to_current_minute().getTime();
    let data = gather_data(now);
    get_HRM(now, data);
  }

  if (settings.enabled) {
    // Activate listeners
    Bangle.on("live_metrics_barometer", persist_barometer);
    Bangle.on("live_metrics_post_data", post_data);

    // If custom id isn't specified use device ID.
    if (settings.bangle_id == '') {
      settings.bangle_id = NRF.getAddress().substr().substr(12).replace(':', '');
    }
    // Calculate time till next run time
    let now = new Date();
    ms_to_next_minute = (60 - now.getSeconds()) * 1000 + (settings.update_interval_in_minutes-1)*60*1000;

    setTimeout(start, ms_to_next_minute);
    setInterval(start, settings.update_interval_in_minutes*60*1000);
  }
  else {
    delete settings;
  }

  return {
    settings,
    stored_data,
    http,
    check_connectivity,
    post_data,
    now_to_current_minute,
    is_waring,
    gather_data,
    start
  };
})();