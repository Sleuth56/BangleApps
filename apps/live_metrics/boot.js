(function () {
  var settings = Object.assign({
    enabled: false,
    update_interval_in_minutes: 1,
    bangle_id: '',
    server_url: '',
    enable_basic_auth: false,
    basic_auth_username: '',
    basic_auth_password: ''
  }, require("Storage").readJSON("live_metrics.json", true) || {});

  // let data = {};
  if (settings.bangle_id == '') {
    settings.bangle_id = NRF.getAddress().substr().substr(12).replace(':', '');
  }

  // http(`${settings.server_url}/health`, 'get', '').then(resp => {
  //   let test = resp.resp;
  //   console.log(`hi: ${test}`);
  // });
  function http(url, method, body) {
    return new Promise(resolve => {
      Bangle.http(url, {
        headers: {'Authorization': `Basic ${creds}`},
        method: method,
        body: body
      }).then(data=>{
        console.log("HTTP_Got ",data);
        return resolve(data);
      }).catch((err) => {
        console.log("HTTP_ERROR: ", err.toString());
      });
    });
  }

  // check_connectivity().then(resp => {
  //   console.log(resp);
  // });
  function check_connectivity() {
    return new Promise(resolve => {
    http(`${settings.server_url}/health`, 'get', '').then(resp => {
        if (resp.resp == "OK") {
          return resolve(1);
        }
        else {
          return resolve(0);
        }
      });
    });
  }

  // function post_data(metric, time, additional_fields, values) {
  //   http(`${settings.server_url}/api/v1/import/csv?format=1:time:unix_ms,2:metric:${metric}${additional_fields}`, 
  //   'post', 
  //   `${time},${values.toString()}`).then(resp => {
  //     console.log(resp);
  //   });
  // }

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

  function get_pressure() {
    Bangle.getPressure().then(d=>{
      console.log(d);
      return d;
      // {temperature, pressure, altitude}
    });
  }

  function post_HRM() {
    Bangle.setHRMPower(true, "live_metrics");
    function _get_HRM(data) {
      if (data['confidence'] > 80) {
        post_data(`banglejs_HRM`, now_to_current_minute().getTime(), ',3:label:id', [data['bpm'], settings.bangle_id]);
        Bangle.setHRMPower(false, "live_metrics");
      }
    }
    Bangle.on('HRM',_get_HRM);
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

  function main() {
    post_data(`banglejs_steps`, now_to_current_minute().getTime(), ',3:label:id', [Bangle.getHealthStatus("day").steps, settings.bangle_id]);
    post_data(`banglejs_battery`, now_to_current_minute().getTime(), ',3:label:id', [E.getBattery(), settings.bangle_id]);
    post_data(`banglejs_temperature`, now_to_current_minute().getTime(), ',3:label:id', [E.getTemperature(), settings.bangle_id]);
    
    // Send pressure and altitude measurements
    Bangle.getPressure().then(d=>{
      post_data(`banglejs_pressure`, now_to_current_minute().getTime(), ',3:label:id', [d.pressure, settings.bangle_id]);
      post_data(`banglejs_altitude`, now_to_current_minute().getTime(), ',3:label:id', [d.altitude, settings.bangle_id]);
    });

    // Are we on a charger?
    if (Bangle.isCharging() == true) {
      // Report that we are on a charger
      post_data(`banglejs_charging`, now_to_current_minute().getTime(), ',3:label:id', [1, settings.bangle_id]);
      post_data(`banglejs_waring`, now_to_current_minute().getTime(), ',3:label:id', [0, settings.bangle_id]);
    }
    // Is the watch not being worn?
    else if (!is_waring()) {
      post_data(`banglejs_charging`, now_to_current_minute().getTime(), ',3:label:id', [0, settings.bangle_id]);
      post_data(`banglejs_waring`, now_to_current_minute().getTime(), ',3:label:id', [0, settings.bangle_id]);
    }
    else {
      // Report that we are not on a charger
      post_data(`banglejs_charging`, now_to_current_minute().getTime(), ',3:label:id', [0, settings.bangle_id]);
      post_data(`banglejs_waring`, now_to_current_minute().getTime(), ',3:label:id', [1, settings.bangle_id]);
      // Send Heart Rate measurements
      post_HRM();

      post_data(`banglejs_movement`, now_to_current_minute().getTime(), ',3:label:id', [Bangle.getHealthStatus("last").movement, settings.bangle_id]);
    }
  }

  function start() {
    main();
    setInterval(main, settings.update_interval_in_minutes*60*1000);
  }

  function startup() {
    // Calculate time till next run time
    let now = new Date();
    ms_to_next_minute = (60 - now.getSeconds()) * 1000 + (settings.update_interval_in_minutes-1)*60*1000;

    setTimeout(start, ms_to_next_minute);
  }

  if (settings.enabled) {
    startup();
  }
})();

// https://www.espruino.com/ReferenceBANGLEJS2#t_l_Bangle_midnight
// Calls things at midnight could be useful to reset data points at midnight