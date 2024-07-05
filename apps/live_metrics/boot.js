global.live_metrics = Object.assign({
  history_upload: false
});

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

  // Gather the data
  let movement_value = 0;
  let movement_samples = 0;
  
  Bangle.on('accel', function(data) { 
    movement_value += data.diff;
    movement_samples ++;
  });

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

  function innumerate_data(data) {
    let output = '';
    for (const line of data.split(`\n`)) {
      let parsed_line = line.split(",");
      output += `
      banglejs_steps{id="${settings.bangle_id}"} ${parsed_line[1]} ${parsed_line[0]}
      banglejs_battery{id="${settings.bangle_id}"} ${parsed_line[2]} ${parsed_line[0]}
      banglejs_temperature{id="${settings.bangle_id}"} ${parsed_line[3]} ${parsed_line[0]}
      banglejs_charging{id="${settings.bangle_id}"} ${parsed_line[4]} ${parsed_line[0]}
      banglejs_waring{id="${settings.bangle_id}"} ${parsed_line[5]} ${parsed_line[0]}
      banglejs_movement{id="${settings.bangle_id}"} ${parsed_line[6]} ${parsed_line[0]}
      banglejs_HRM{id="${settings.bangle_id}"} ${parsed_line[7]} ${parsed_line[0]}
      banglejs_pressure{id="${settings.bangle_id}"} ${parsed_line[8]} ${parsed_line[0]}
      banglejs_altitude{id="${settings.bangle_id}"} ${parsed_line[9]} ${parsed_line[0]}
      `;
          }
          return output;
        }
      
        function post_data(data) {
          return new Promise(resolve => {
            console.log(data);
            check_connectivity().then(is_connected => {
              if (is_connected) {
                let formatted_data = innumerate_data(data);
                let url = `${settings.server_url}/api/v1/import/prometheus`;
                if (settings.enable_basic_auth) {
                  let creds = `${settings.basic_auth_username}:${settings.basic_auth_password}`;
                  Bangle.http(url, {
                    headers: {'Authorization': `Basic ${btoa(creds)}`},
                    method: "post",
                    body: formatted_data
                  }).then(data=>{
                    console.log("Got ",data);
                    return resolve("Success!");
                  }).catch((err) => {
                    console.log("Got ", err.toString());
                  });
                }
                else {
                  Bangle.http(url, {
                    method: "post",
                    body: formatted_data
                  }).then(data=>{
                    console.log("Got ",data);
                    return resolve("Success!");
                  }).catch((err) => {
                    console.log("Got ", err.toString());
                  });
                }
              }
              else {
                console.log("Not connected!");
                data += `\n`;
                stored_data_append = require("Storage").open("live_metrics.cache","a");
                stored_data_append.write(data);
              }
            });
          });
          }
      
        function now_to_current_minute() {
          let coeff = 1000 * 60 * 1;
          let now = new Date();
          return new Date(Math.round(now.getTime() / coeff) * coeff);
        }

        function is_waring() {
          // If the watch is colder than 30C it's not being worn
          if (E.getTemperature() >= 24 || Math.round((movement_value*8192.0)/movement_samples) >= 200) {
            return 1;
          }
          else {
            return 0;
          }
        }
      
        function gather_data(now) {
          let data = `${now},`;
      
          // Current steps
          data += `${Bangle.getHealthStatus("day").steps},`;
          // Battery in percentage
          data += `${E.getBattery()},`;
          // Temperature in C
          data += `${E.getTemperature()},`;
      
          if (Bangle.isCharging() == true) {
            // Report that we are on a charger
            data += `1,`;
            data += `0,`;
          }
          // Is the watch not being worn?
          else if (!is_waring()) {
            data += `0,`;
            data += `0,`;
          }
          else {
            // Report that we are not on a charger
            data += `0,`;
            data += `1,`;
          }
          
          // // Movement
          data += `${Math.round((movement_value*8192.0)/movement_samples)},`;
          // Reset every minute
          movement_value = 0;
          movement_samples = 0;
      
          return data;
        }
      
        function persist_barometer(data) {
          Bangle.getPressure().then(barometer_data=>{
            data += `${Math.round(barometer_data.pressure)},`;
            data += `${Math.round(barometer_data.altitude)},`;
            Bangle.emit("live_metrics_post_data", data);
          });
        }

        function get_HRM(now, data) {
          // Global HRM Check
          if (typeof global.hrm !== 'undefined' && global.hrm.enabled == true) {
            data += `${global.hrm.bpm},`;
            Bangle.emit("live_metrics_barometer", data);
          }
          // No global HRM
          else {
            Bangle.setHRMPower(true, "live_metrics");
            function _get_HRM(hrm_data) {
              if (hrm_data.confidence > 80) {
                Bangle.setHRMPower(false, "live_metrics");
                Bangle.removeListener('HRM',_get_HRM);
                data += `${hrm_data.bpm},`;
                Bangle.emit("live_metrics_barometer", data);
              }
            }
            Bangle.on('HRM',_get_HRM);
          }
        }
      
        // Returns a string of n number of lines from the specified file.
        // If the file isn't that long than it returns the entire file.
        function read_lines(file, line_count) {
          let lines = '';
          let line = file.readLine();
      
          let loop = 1;
          if (line === undefined) {
            return undefined;
          }
          while (loop <= line_count && line !== undefined) {
            lines += line;
            line = file.readLine();
            loop ++;
          }
          return lines;
        }
      
        function history(file) {
          let lines = read_lines(file, 30);
          if (lines === undefined) {
            file.erase();
            global.live_metrics.history_upload = false;
            return;
          }
          post_data(lines).then((value) => {
            setTimeout(history, 1000, file);
          });
        }

        function start() {
          let now = now_to_current_minute().getTime();
          let data = gather_data(now);
      
          // Run historical data
          let stored_data_read = require("Storage").open("live_metrics.cache","r");
          if (stored_data_read.readLine() && !global.live_metrics.history_upload) {
            global.live_metrics.history_upload = true;
            check_connectivity().then(is_connected => {
              stored_data_read = require("Storage").open("live_metrics.cache","r");
              if (is_connected) {
                history(stored_data_read);
              }
            });
          }
          // Gather Current data
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
          http,
          history,
          check_connectivity,
          post_data,
          read_lines,
          innumerate_data,
          now_to_current_minute,
          is_waring,
          gather_data,
          start
        };
      })();
