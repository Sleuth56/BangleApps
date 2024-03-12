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

  var now = 0;
  var data = require("Storage").readJSON("live_metrics.data.json", true) || {};

  function http(url, method, body) {
    let creds = `${settings.basic_auth_username}:${settings.basic_auth_password}`;
    return new Promise(resolve => {
      Bangle.http(url, {
        headers: {'Authorization': `Basic ${btoa(creds)}`},
        method: method,
        body: body
      }).then(data=>{
        // console.log("HTTP_Got ",data);
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

  function post_data(metric, time, additional_fields, values) {
    let url = `${settings.server_url}/api/v1/import/csv?format=1:time:unix_ms,2:metric:${metric}${additional_fields}`;
    if (settings.enable_basic_auth) {
      let creds = `${settings.basic_auth_username}:${settings.basic_auth_password}`;
      Bangle.http(url, {
        headers: {'Authorization': `Basic ${btoa(creds)}`},
        method: "post",
        body: `${time},${values.toString()}`
      }).then(data=>{
        console.log("Got ",data);
      }).catch((err) => {
        console.log("Got ", err.toString());
      });
    }
    else {
      Bangle.http(url, {
        method: "post",
        body: `${time},${values.toString()}`
      }).then(data=>{
        console.log("Got ",data);
      }).catch((err) => {
        console.log("Got ", err.toString());
      });
    }
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
  
  function gather_data() {
    now = now_to_current_minute().getTime();
    data = require("Storage").readJSON("live_metrics.data.json", true) || {};
    // Get sensor data
    data[now] = {};
    data[now]['banglejs_steps'] = Bangle.getHealthStatus("day").steps;
    data[now]['banglejs_battery'] = E.getBattery();
    data[now]['banglejs_temperature'] = E.getTemperature();

    if (Bangle.isCharging() == true) {
      // Report that we are on a charger
      data[now]['banglejs_charging'] = 1;
      data[now]['banglejs_waring'] = 0;
    }
    // Is the watch not being worn?
    else if (!is_waring()) {
      data[now]['banglejs_charging'] = 0;
      data[now]['banglejs_waring'] = 0;
    }
    else {
      // Report that we are not on a charger
      data[now]['banglejs_charging'] = 0;
      data[now]['banglejs_waring'] = 1;
      
      // Movement
      data[now]['banglejs_movement'] = Bangle.getHealthStatus("last").movement;
      
      // Barometer
      Bangle.getPressure().then(barometer_data=>{
        Bangle.emit("live_metrics_barometer", barometer_data);
      });
    }
  }

  function persist_barometer(barometer_data) {
    data[now]['banglejs_pressure'] = barometer_data.pressure;
    data[now]['banglejs_altitude'] = barometer_data.altitude;
    get_HRM();
  }

  function get_HRM() {
    // Global HRM Check
    if (typeof global.hrm !== 'undefined' && global.hrm.enabled == true) {
      data[now]['banglejs_HRM'] = global.hrm.bpm;
      Bangle.emit("live_metrics_done");
    }
    // No global HRM
    else {
      Bangle.setHRMPower(true, "live_metrics");
      function _get_HRM(data) {
        if (data.confidence > 80) {
          Bangle.setHRMPower(false, "live_metrics");
          data[now]['banglejs_HRM'] = hrm.bpm;
          Bangle.emit("live_metrics_done");
        }
      }
      Bangle.on('HRM',_get_HRM);
    }
  }

  function done() {
    // Check connectivity
    check_connectivity().then(is_connected => {
      if (is_connected) {
        count = 0;
        for (const time in data) {
          console.log(`hello: ${time}`);
          for (const metric in data[time]) {
            setTimeout(function(metric, time, data, bangle_id) {
              post_data(metric, time, ',3:label:id', [data[time][metric], bangle_id]);
            }, (100*count)+1, metric, time, data, settings.bangle_id);
          };
          count += 1;
        }
        data = {};
        // require("Storage").writeJSON("live_metrics.data.json", data);
      }
      else {
        // require("Storage").writeJSON("live_metrics.data.json", data);
      }
      console.log(data);
    });
  }

  function start() {
    gather_data();
    setInterval(gather_data, settings.update_interval_in_minutes*60*1000);
  }

  if (settings.enabled) {
    // Activate listeners
    Bangle.on("live_metrics_barometer", persist_barometer);
    Bangle.on("live_metrics_done", done);

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
    done,
    data,
    gather_data,
    settings,
    http,
    check_connectivity
  };
})();

// live_metrics.gather_data();
// live_metrics.data  for (const time in live_metrics.data) {console.log(time)}
// live_metrics.check_connectivity().then(is_connected => {console.log(is_connected);});
// live_metrics.done()

// https://www.espruino.com/ReferenceBANGLEJS2#t_l_Bangle_midnight
// Calls things at midnight could be useful to reset data points at midnight